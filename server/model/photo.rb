require_relative "../utils/amazon_utils"

class Photo < Sequel::Model
	one_to_one :hike

	def self.get_rendition_suffix rendition
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

	def self.create_with_renditions file
		name = UUIDTools::UUID.random_create.to_s

		original_image = Magick::Image.read(file.path).first
		original_image.resize_to_fit!(2400, 2400)
		original_image.strip!
		original_image.profile!("*", nil)
		renditions = get_photo_renditions(original_image)
		if settings.production?	
			bucket = AmazonUtils.s3.buckets["assets.hike.io"]
			dst_dir = "hike-images/tmp/uploading/"
			Photo.each_rendition_including_original do |rendition|
				object_path = dst_dir + name + get_rendition_suffix(rendition)
				if rendition == "original"
					bucket.objects[object_path].write(renditions[rendition].to_blob)
				else
					bucket.objects[object_path].write(renditions[rendition].to_blob { self.quality = 87 }) 
				end
			end
		end
		Photo.create({
			:string_id => "tmp/uploading/" + name,
			:width => original_image.columns,
			:height => original_image.rows
		})
	end

	def self.each_rendition &block
		yield "large"
		yield "medium"
		yield "small"
		yield "tiny"
		yield "thumb"
		yield "thumb-tiny"
	end

	def self.each_rendition_including_original &block
		yield "original"
		self.each_rendition &block
	end

	def move_on_s3_if_needed(hike)
		if self.string_id.start_with? "tmp/"
			src = "hike-images/" + self.string_id
			photo_id = self.string_id["tmp/uploading/".length..-1]
			dst_dir = "hike-images/" + hike.string_id + "/"
			dst = dst_dir + photo_id
			if settings.production?
				Photo.each_rendition_including_original do |rendition_name|
					suffix = get_rendition_suffix(rendition_name)
					AmazonUtils.s3.buckets["assets.hike.io"].objects[src + suffix].move_to(dst + suffix)
				end
			end
			self.string_id = hike.string_id + "/" + photo_id
			self.save_changes
		end
	end
end