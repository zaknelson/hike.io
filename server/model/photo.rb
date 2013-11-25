require_relative "../utils/amazon_utils"

class Photo < Sequel::Model
	one_to_one :hike

	def self.get_rendition_suffix rendition
		"-" + rendition + ".jpg"
	end

	def self.get_photo_renditions original_image
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
		sharpened_image.destroy!
		renditions
	end

	def self.get_resized_dimensions image, cropToLandscape
		width = image.columns
		height = image.rows
		if (cropToLandscape)
			width = 2400
			height = 800
		else
			if width > height
				height = (height * 2400.0 / width).round
				width = 2400
			else
				width = (width * 2400.0 / height).round
				height = 2400
			end
		end
		{ :width => width, :height => height }
	end

	def self.create_with_renditions file, cropToLandscape=false
		name = UUIDTools::UUID.random_create.to_s
		original_image = Magick::Image.read(file.path).first
		original_image.auto_orient!
		resized_dimensions = Photo.get_resized_dimensions(original_image, cropToLandscape)
		photo = Photo.create({
			:string_id => "tmp/uploading/" + name,
			:width => resized_dimensions[:width],
			:height => resized_dimensions[:height]
		})
		Thread.new do
			Photo.db.transaction do
				begin
					photo.lock!
					if (cropToLandscape)
						original_image.resize_to_fill!(2400, 800)
					else
						original_image.resize_to_fit!(2400, 2400)
					end
					original_image.strip!
					original_image.profile!("*", nil)
					renditions = get_photo_renditions(original_image)
					if Sinatra::Application.environment() == :production
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
					else
						dst_dir = HikeApp.root + "/public/hike-images/tmp/uploading/"
						FileUtils.mkdir_p(dst_dir)
						Photo.each_rendition_including_original do |rendition|
							object_path = dst_dir + name + get_rendition_suffix(rendition)
							renditions[rendition].write(object_path) { self.quality = 87 }
						end
					end
				rescue => exception
					puts exception.backtrace
				ensure
					GC.start
					original_image.destroy!
				end
			end
		end
		photo
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

	def photo_id
		s = self.string_id
		s[s.rindex("/")+1..-1]
	end

	def move_on_s3 hike
		src = "hike-images/" + self.string_id
		dst_dir = "hike-images/" + hike.string_id + "/"
		dst = dst_dir + photo_id

		if Sinatra::Application.environment() == :production
			Photo.each_rendition_including_original do |rendition_name|
				suffix = Photo.get_rendition_suffix(rendition_name)
				AmazonUtils.s3.buckets["assets.hike.io"].objects[src + suffix].move_to(dst + suffix)
			end
		elsif Sinatra::Application.environment() == :development
			FileUtils.mkdir_p(HikeApp.root + "/public/" + dst_dir)
			Photo.each_rendition_including_original do |rendition_name|
				suffix = Photo.get_rendition_suffix(rendition_name)
				FileUtils.mv(HikeApp.root + "/public/" + src + suffix, HikeApp.root + "/public/" + dst + suffix)
			end
		end

		self.string_id = hike.string_id + "/" + photo_id
		self.save_changes
	end

	def destroy_and_move_on_s3
		self.destroy
		if Sinatra::Application.environment() == :production
			bucket = AmazonUtils.s3.buckets["assets.hike.io"]
			src = "hike-images/" + self.string_id
			dst = "hike-images/tmp/deleted/" + self.string_id
			Photo.each_rendition_including_original do |rendition|
				suffix = Photo.get_rendition_suffix(rendition)
				bucket.objects[src + suffix].move_to(dst + suffix)
			end
		elsif Sinatra::Application.environment() == :development
			src = HikeApp.root + "/public/hike-images/" + self.string_id
			dst_dir = HikeApp.root + "/public/hike-images/tmp/deleted/"
			FileUtils.mkdir_p(dst_dir)
			Photo.each_rendition_including_original do |rendition|
				FileUtils.mv(src + Photo.get_rendition_suffix(rendition), dst_dir)
			end
		end
	end

	def is_in_tmp_folder_on_s3?
		self.string_id.start_with? "tmp/"
	end
end