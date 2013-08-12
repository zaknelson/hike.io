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
		Hike.each_photo_type do |photo_key|
			existing_photo = hike.send(photo_key)
			if json[photo_key] != nil
				new_photo = Photo.find(:id => json[photo_key]["id"])
				hike.send "#{photo_key}=", new_photo
				move_photo_if_needed(new_photo, hike)
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
				Photo.each_rendition do |rendition|
					suffix = get_rendition_suffix(rendition)
					bucket.objects[src + suffix].move_to(dst + suffix)
				end
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
		renditions = get_photo_renditions(original_image)
		if settings.production?	
			bucket = s3.buckets["assets.hike.io"]
			dst_dir = "hike-images/tmp/uploading/"
			Photo.each_rendition_including_original do |rendition|
				blob = renditions[rendition].to_blob
				object_path = dst_dir + name + get_rendition_suffix(rendition)
				if rendition == "original"
					bucket.objects[object_path].write(blob)
				else
					bucket.objects[object_path].write(blob) { self.quality = 87 }
				end
			end
		end
		photo = Photo.create({
			:string_id => "tmp/uploading/" + name,
			:width => original_image.columns,
			:height => original_image.rows
		})

		photo.to_json
	end

	def get_rendition_suffix rendition
		"-" + rendition + ".jpg"
	end

	def get_photo_renditions original_image
		renditions = {}
		sharpened_image = original_image.unsharp_mask(2, 0.5, 0.7, 0) #http://even.li/imagemagick-sharp-web-sized-photographs/
		renditions["original"] = original_image
		if original_image.columns > original_image.rows
			renditions["large"] = sharpened_image.resize_to_fit(1200)
			renditions["medium"] = sharpened_image.resize_to_fit(800)
			renditions["small"] = sharpened_image.resize_to_fit(400)
			renditions["tiny"] = sharpened_image.resize_to_fit(200)
		else
			renditions["large"] = sharpened_image.resize_to_fit(1200, 2400)
			renditions["medium"] = sharpened_image.resize_to_fit(800, 1600)
			renditions["small"] = sharpened_image.resize_to_fit(400, 800)
			renditions["tiny"] = sharpened_image.resize_to_fit(200, 400)
		end
		renditions["thumb"] = sharpened_image.crop_resized(400, 400)
		renditions["thumb-tiny"] = sharpened_image.crop_resized(200, 200)
		renditions
	end

	def move_photo_if_needed photo, hike
		if photo.string_id.start_with? "tmp/"
			src = "hike-images/" + photo.string_id
			photo_id = photo.string_id["tmp/uploading/".length..-1]
			dst_dir = "hike-images/" + hike.string_id + "/"
			dst = dst_dir + photo_id
			if settings.production?
				Photo.each_rendition_including_original do |rendition_name|
					suffix = get_rendition_suffix(rendition_name)
					s3.buckets["assets.hike.io"].objects[src + suffix].move_to(dst + suffix)
				end
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