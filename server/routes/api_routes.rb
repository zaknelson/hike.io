require "aws-sdk"
require "sanitize"
require "RMagick"
require "uuidtools"

require_relative "../server"
require_relative "../utils/routes_utils"
require_relative "../utils/string_utils"

class HikeApp < Sinatra::Base

	get "/api/v1/hikes", :provides => "json" do
		array_as_json(Hike.order(:id).all, get_fields_filter) 
	end

	post "/api/v1/hikes", :provides => "json" do
		return 403 if not is_admin?
		json = JSON.parse request.body.read rescue return 400
		return 400 if not is_valid_hike_input? json
		return 409 if Hike[:string_id => Hike.create_string_id_from_name(json["name"])]
		hike = Hike.create_from_json json
		hike.update_keywords
		hike.save
		hike.as_json
	end

	get "/api/v1/hikes/search", :provides => "json" do
		query = params[:q]
		return 400 if not query

		search_executor = SearchExecutor.new
		search_executor.logger = logger
		search_executor.query = query
		search_results = search_executor.execute

		if (search_executor.has_best_result) 
			array_as_json([search_results[0]], get_fields_filter) 
		else
			array_as_json(search_results, get_fields_filter)
		end
	end

	get "/api/v1/hikes/:hike_id", :provides => "json" do
		hike = RoutesUtils.get_hike_from_id params[:hike_id]
		return 404 if not hike
		hike.as_json get_fields_filter if hike
	end

	put "/api/v1/hikes/:hike_id", :provides => "json" do
		return 403 if not is_admin?
		hike = RoutesUtils.get_hike_from_id params[:hike_id]
		return 404 if not hike
		json = JSON.parse request.body.read rescue return 400
		return 400 if not is_valid_hike_input? json

		hike.update_from_json json
		hike.update_keywords if json["name"] != hike.name

		removed_photos = []
		hike.each_photo do |photo_key|
			existing_photo = hike.send(photo_key)
			if json[photo_key] != nil
				hike.send "#{photo_key}=", Photo.find(:id => json[photo_key]["id"])
				move_photo_if_needed existing_photo, hike if existing_photo
			elsif existing_photo
				removed_photos.push existing_photo
				hike.send "#{photo_key}=", nil
			end
		end

		if json["photos_generic"]
			new_generic_photos = []
			json["photos_generic"].each do |photo, index|
				photo = Photo.find(:id => photo["id"])
				new_generic_photos.push(photo) if photo
			end

			added_generic_photos = new_generic_photos - hike.photos_generic
			removed_generic_photos = hike.photos_generic - new_generic_photos

			added_generic_photos.each do |photo|
				hike.add_photos_generic(photo)
				move_photo_if_needed photo, hike
			end

			removed_photos += removed_generic_photos
			
			removed_generic_photos.each do |photo|
				hike.remove_photos_generic(photo)
			end
		end

		hike.edit_time = Time.now
		hike.location.save_changes
		hike.save_changes
		
		removed_photos.each do |photo|
			photo.delete
			if settings.production?
				bucket = s3.buckets["assets.hike.io"]
				src = "hike-images/" + photo.string_id
				dst = "hike-images/tmp/deleted/" + photo.string_id
				bucket.objects[src + "-original.jpg"].move_to(dst + "-original.jpg")
				bucket.objects[src + "-large.jpg"].move_to(dst + "-large.jpg")
				bucket.objects[src + "-medium.jpg"].move_to(dst + "-medium.jpg")
				bucket.objects[src + "-small.jpg"].move_to(dst + "-small.jpg")
				bucket.objects[src + "-thumb.jpg"].move_to(dst + "-thumb.jpg")
			else
				src = self.root + "/public/hike-images/" + photo.string_id
				dst_dir = self.root + "/public/hike-images/tmp/deleted/"
				FileUtils.mkdir_p(dst_dir)
				FileUtils.mv(src + "-original.jpg", dst_dir)
				FileUtils.mv(src + "-large.jpg", dst_dir)
				FileUtils.mv(src + "-medium.jpg", dst_dir)
				FileUtils.mv(src + "-small.jpg", dst_dir)
				FileUtils.mv(src + "-thumb.jpg", dst_dir)
			end
		end

		hike.as_json
	end

	post "/api/v1/hikes/:hike_id/photos", :provides => "json" do
		return 403 if not is_admin?
		hike = RoutesUtils.get_hike_from_id params[:hike_id]
		uploaded_file = params[:file]
		return 404 if not hike
		return 400 if not uploaded_file

		name = UUIDTools::UUID.random_create.to_s

		original_image = Magick::Image.read(uploaded_file[:tempfile].path).first
		original_image.resize_to_fit!(2400, 2400)
		original_image.strip!
		original_image.profile!("*", nil)
		sharpened_image = original_image.unsharp_mask(2, 0.5, 0.7, 0) #http://even.li/imagemagick-sharp-web-sized-photographs/
		if original_image.columns > original_image.rows
			large_image = sharpened_image.resize_to_fit(1200)
			medium_image = sharpened_image.resize_to_fit(800)
			small_image = sharpened_image.resize_to_fit(400)
			tiny_image = sharpened_image.resize_to_fit(200)
		else
			large_image = sharpened_image.resize_to_fit(1200, 2400)
			medium_image = sharpened_image.resize_to_fit(800, 1600)
			small_image = sharpened_image.resize_to_fit(400, 800)
			tiny_image = sharpened_image.resize_to_fit(200, 400)
		end
		
		thumb_image = sharpened_image.crop_resized(400, 400)
		tiny_thumb_image = sharpened_image.crop_resized(200, 200)

		if settings.production?
			bucket = s3.buckets["assets.hike.io"]
			dst_dir = "hike-images/tmp/uploading/"
			bucket.objects[dst_dir + name + "-original.jpg"].write(original_image.to_blob)
			bucket.objects[dst_dir + name +  "-large.jpg"].write(large_image.to_blob { self.quality = 87 })
			bucket.objects[dst_dir + name +  "-medium.jpg"].write(medium_image.to_blob { self.quality = 87 }) 
			bucket.objects[dst_dir + name +  "-small.jpg"].write(small_image.to_blob { self.quality = 87 })
			bucket.objects[dst_dir + name +  "-tiny.jpg"].write(tiny_image.to_blob { self.quality = 87 })
			bucket.objects[dst_dir + name +  "-thumb.jpg"].write(thumb_image.to_blob { self.quality = 87 })
			bucket.objects[dst_dir + name +  "-thumb-tiny.jpg"].write(tiny_thumb_image.to_blob { self.quality = 87 })
		else
			dst_dir = self.root + "/public/hike-images/tmp/uploading/"
			FileUtils.mkdir_p(dst_dir)
			original_image.write(dst_dir + name + "-original.jpg") {  self.quality = 87 }
			large_image.write(dst_dir + name + "-large.jpg") {  self.quality = 87 }
			medium_image.write(dst_dir + name + "-medium.jpg") {  self.quality = 87 }
			small_image.write(dst_dir + name + "-small.jpg") {  self.quality = 87 }
			tiny_image.write(dst_dir + name + "-tiny.jpg") {  self.quality = 87 }
			thumb_image.write(dst_dir + name + "-thumb.jpg") {  self.quality = 87 }
			tiny_thumb_image.write(dst_dir + name + "-thumb-tiny.jpg") {  self.quality = 87 }
		end

		photo = Photo.create({
			:string_id => "tmp/uploading/" + name,
			:width => original_image.columns,
			:height => original_image.rows
		})

		photo.to_json
	end

	def move_photo_if_needed photo, hike
		if photo.string_id.start_with? "tmp/"
			src = "hike-images/" + photo.string_id
			photo_id = photo.string_id["tmp/uploading/".length..-1]
			dst_dir = "hike-images/" + hike.string_id + "/"
			dst = dst_dir + photo_id
			if settings.production?
				s3.buckets["assets.hike.io"].objects[src + "-original.jpg"].move_to(dst + "-original.jpg")
				s3.buckets["assets.hike.io"].objects[src + "-large.jpg"].move_to(dst + "-large.jpg")
				s3.buckets["assets.hike.io"].objects[src + "-medium.jpg"].move_to(dst + "-medium.jpg")
				s3.buckets["assets.hike.io"].objects[src + "-small.jpg"].move_to(dst + "-small.jpg")
				s3.buckets["assets.hike.io"].objects[src + "-thumb.jpg"].move_to(dst + "-thumb.jpg")
			else
				FileUtils.mkdir_p(self.root + "/public/" + dst_dir)
				FileUtils.mv(self.root + "/public/" + src + "-original.jpg", self.root + "/public/" + dst + "-original.jpg")
				FileUtils.mv(self.root + "/public/" + src + "-large.jpg", self.root + "/public/" + dst + "-large.jpg")
				FileUtils.mv(self.root + "/public/" + src + "-medium.jpg", self.root + "/public/" + dst + "-medium.jpg")
				FileUtils.mv(self.root + "/public/" + src + "-small.jpg", self.root + "/public/" + dst + "-small.jpg")
				FileUtils.mv(self.root + "/public/" + src + "-thumb.jpg", self.root + "/public/" + dst + "-thumb.jpg")
			end

			photo.string_id = hike.string_id + "/" + photo_id
			photo.save_changes
		end
	end

	def s3
		@s3 = @s3 || AWS::S3.new(
			:access_key_id     => ENV["S3_ACCESS_KEY_ID"],
			:secret_access_key => ENV["S3_SECRET_ACCESS_KEY"]
		)
		@s3
	end

	def is_valid_hike_input? json
		json["name"] &&
			json["locality"] &&
			json["distance"] &&
			json["elevation_max"] &&
			json["location"] && 
			json["location"]["latitude"] &&
			json["location"]["longitude"] &&
			StringUtils.is_numeric?(json["distance"]) &&
			StringUtils.is_numeric?(json["elevation_max"]) &&
			StringUtils.is_numeric?(json["location"]["latitude"]) &&
			StringUtils.is_numeric?(json["location"]["longitude"]) &&
			is_valid_latitude?(json["location"]["latitude"]) &&
			is_valid_longitude?(json["location"]["longitude"])
	end

	def is_valid_latitude? latitude
		latitude = latitude.to_f
		latitude >= -90 and latitude <= 90
	end

	def is_valid_longitude? longitude
		longitude = longitude.to_f
		longitude >= -180 and longitude <= 180
	end

	def get_fields_filter
		params[:fields] ? params[:fields].split(",") : nil
	end
end