require "aws-sdk"
require "RMagick"
require "uuidtools"

require_relative "../server"
require_relative "../utils/routes_utils"

class HikeApp < Sinatra::Base

	get "/api/v1/hikes", :provides => "json" do
		Hike.all.to_json
	end

	post "/api/v1/hikes", :provides => "json" do
		return 403 if not is_admin?
		json = JSON.parse request.body.read
		string_id = json["name"].downcase.split(" ").join("-")
		hike = Hike.create(
			:string_id => string_id,
			:name => json["name"],
			:locality => json["locality"],
			:distance => json["distance"],
			:elevation_max => json["elevation_max"],
			:creation_time => Time.now,
			:edit_time => Time.now
			);
		hike.location = Location.create(
			:latitude => json["location"]["latitude"],
			:longitude => json["location"]["longitude"]
			);

		keywords = KeywordUtils.new.sanitize_to_keywords(hike.name)
		keywords.each do |keyword|
			hike.add_keyword(Keyword.find_or_create(:keyword => keyword))
		end

		hike.save
		hike.to_json
	end

	get "/api/v1/hikes/search", :provides => "json" do
		query = params[:q];
		400 if not query

		search_executor = SearchExecutor.new
		search_executor.logger = logger
		search_executor.query = query
		search_results = search_executor.execute

		if (search_executor.has_best_result) 
			[search_results[0]].to_json
		else
			search_results.to_json
		end
	end

	get "/api/v1/hikes/:hike_id", :provides => "json" do
		hike = RoutesUtils.new.get_hike_from_id params[:hike_id]
		hike.to_json if hike
	end

	put "/api/v1/hikes/:hike_id", :provides => "json" do
		return 403 if not is_admin?
		hike = RoutesUtils.new.get_hike_from_id params[:hike_id]
		return 404 if not hike

		removed_photos = []

		json = JSON.parse request.body.read

		# Replace keywords if name has changed
		if json["name"] && json["name"] != hike.name
			hike.remove_all_keywords
			keywords = KeywordUtils.new.sanitize_to_keywords(json["name"])
			keywords.each do |keyword|
				hike.add_keyword(Keyword.find_or_create(:keyword => keyword))
			end
		end

		hike.name = json["name"] if json["name"]
		hike.description = json["description"] if json["description"]
		hike.distance = json["distance"] if json["distance"]
		hike.elevation_max = json["elevation_max"] if json["elevation_max"]
		hike.locality = json["locality"] if json["locality"]

		if json["photo_landscape"] != nil
			hike.photo_landscape = Photo.find(:id => json["photo_landscape"]["id"])
			move_photo_if_needed hike.photo_landscape, hike
		else
			removed_photos.push hike.photo_landscape if hike.photo_landscape
			hike.photo_landscape = nil
		end

		if json["photo_preview"] != nil
			hike.photo_preview = Photo.find(:id => json["photo_preview"]["id"])
			move_photo_if_needed hike.photo_preview, hike
		else
			removed_photos.push hike.photo_preview if hike.photo_preview
			hike.photo_preview = nil
		end

		if json["photo_facts"] != nil
			hike.photo_facts = Photo.find(:id => json["photo_facts"]["id"])
			move_photo_if_needed hike.photo_facts, hike
		else
			removed_photos.push hike.photo_facts if hike.photo_facts
			hike.photo_facts = nil
		end

		if json["location"] and json["location"]["longitude"] and json["location"]["latitude"]
			if not hike.location
				hike.location = Location.create(
					:latitude => json["location"]["latitude"],
					:longitude => json["location"]["longitude"]
					);
			else
				hike.location.latitude = json["location"]["latitude"]
				hike.location.longitude = json["location"]["longitude"]
				hike.location.save_changes
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

		hike.to_json
	end

	post "/api/v1/hikes/:hike_id/photos", :provides => "json" do
		return 403 if not is_admin?
		hike = RoutesUtils.new.get_hike_from_id params[:hike_id]
		uploaded_file = params[:file]
		return 404 if not hike
		return 400 if not uploaded_file

		name = UUIDTools::UUID.random_create.to_s

		photo = Photo.create({
			:string_id => "tmp/uploading/" + name
		})

		original_image = Magick::Image.read(uploaded_file[:tempfile].path).first
		original_image.resize_to_fit!(2400, 2400)
		large_image = original_image.resize_to_fit(1200)
		medium_image = original_image.resize_to_fit(800)
		small_image = original_image.resize_to_fit(400)
		thumb_image = original_image.crop_resized(400, 400)

		if settings.production?
			bucket = s3.buckets["assets.hike.io"]
			dst_dir = "hike-images/tmp/uploading/"
			bucket.objects[dst_dir + name + "-original.jpg"].write(original_image.to_blob)
			bucket.objects[dst_dir + name +  "-large.jpg"].write(large_image.to_blob)
			bucket.objects[dst_dir + name +  "-medium.jpg"].write(medium_image.to_blob)
			bucket.objects[dst_dir + name +  "-small.jpg"].write(small_image.to_blob)
			bucket.objects[dst_dir + name +  "-thumb.jpg"].write(thumb_image.to_blob)
		else
			dst_dir = self.root + "/public/hike-images/tmp/uploading/"
			FileUtils.mkdir_p(dst_dir)
			original_image.write(dst_dir + name + "-original.jpg")
			large_image.write(dst_dir + name + "-large.jpg")
			medium_image.write(dst_dir + name + "-medium.jpg")
			small_image.write(dst_dir + name + "-small.jpg")
			thumb_image.write(dst_dir + name + "-thumb.jpg")
		end

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

end