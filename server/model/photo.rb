require "mini_magick"
require_relative "../utils/amazon_utils"

class Photo < Sequel::Model
	one_to_one :hike

	def self.get_rendition_suffix rendition
		"-" + rendition + ".jpg"
	end

	def self.get_resized_dimensions image, crop_to_landscape
		dimensions = image["%w %h"].split()
		width = dimensions[0].to_i
		height = dimensions[1].to_i
		if (crop_to_landscape)
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

	def self.do_create_photo_renditions(path)
		# This command strips the original image, resizes it and then saves it. Then it applies 
		# sharpening and quality to the other renditions, and resizes them appropriately.

		# Ideally this would be done with a higher level library like RMagick or mini_magick.
		# But... RMagick really eats up memory. So much so that the app started failing on Heroku.
		# Mini_magick is considerably better in terms of memory, and faster, except I can't
		# figure out how to chain together a command like this. And chaining gives you a huge boost
		# in speed, in this case ~6s -> ~1.5s.
		str = "convert #{path} -auto-orient +profile '*' -resize 2400x2400 #{path + Photo.get_rendition_suffix('original')};" \
			"convert #{path + Photo.get_rendition_suffix('original')} -unsharp 2x0.5+0.7+0 -quality 87 " \
			"\\( +clone -resize 1200x1200 -write #{path + Photo.get_rendition_suffix('large')} +delete \\) " \
			"\\( +clone -resize 800x800 -write #{path + Photo.get_rendition_suffix('medium')} +delete \\) " \
			"\\( +clone -resize 400x400 -write #{path + Photo.get_rendition_suffix('small')} +delete \\) " \
			"\\( +clone -resize 200x200 -write #{path + Photo.get_rendition_suffix('tiny')} +delete \\) " \
			"\\( +clone -resize 400x400^ -gravity center -extent 400x400  -write #{path + Photo.get_rendition_suffix('thumb')} +delete \\) " \
			"-resize 200x200^ -gravity center -extent 200x200 #{path + Photo.get_rendition_suffix('thumb-tiny')}";
		system(str)
	end


	def self.create_with_renditions file, crop_to_landscape=false
		name = UUIDTools::UUID.random_create.to_s
		uploaded_image = MiniMagick::Image.open(file.path)
		dimensions = Photo.get_resized_dimensions(uploaded_image, crop_to_landscape)
		photo = Photo.create({
			:string_id => "tmp/uploading/" + name,
			:width => dimensions[:width],
			:height => dimensions[:height]
		})
		Thread.new do
			Photo.db.transaction do
				begin
					photo.lock!
					Photo.do_create_photo_renditions(file.path)
					if Sinatra::Application.environment() == :production
						bucket = AmazonUtils.s3.buckets["assets.hike.io"]
						dst_dir = "hike-images/tmp/uploading/"
						Photo.each_rendition_including_original do |rendition_name|
							object_path = dst_dir + name + get_rendition_suffix(rendition_name)
							rendition_path = file.path + Photo.get_rendition_suffix(rendition_name)
							bucket.objects[object_path].write(rendition_path)
						end
					else
						dst_dir = HikeApp.root + "/public/hike-images/tmp/uploading/"
						FileUtils.mkdir_p(dst_dir)
						Photo.each_rendition_including_original do |rendition_name|
							object_path = dst_dir + name + get_rendition_suffix(rendition_name)
							rendition_path = file.path + Photo.get_rendition_suffix(rendition_name)
							FileUtils.mv(rendition_path, object_path)
						end
					end
				rescue => exception
					puts exception.backtrace
				end
			end
		end
		photo
	end

	def self.each_rendition &block
		# rendition_name, max_size, is_thumb
		yield "large", 1200
		yield "medium", 800
		yield "small", 400
		yield "tiny", 200
		yield "thumb", 400, true
		yield "thumb-tiny", 200, true
	end

	def self.each_rendition_including_original &block
		yield "original", 2400
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