
require "sinatra"
require "sinatra/sequel"
require "aws-sdk"
#require "RMagick"

def s3
	@s3 = @s3 || AWS::S3.new(
		:access_key_id     => ENV["S3_ACCESS_KEY_ID"],
		:secret_access_key => ENV["S3_SECRET_ACCESS_KEY"]
	)
	@s3
end

#set :database, ENV["DATABASE_URL"]

def strip_metadata object
	blob = object.read
	if blob.length > 0
		image = Magick::Image.from_blob(blob).first
		image.strip!
		image.profile!("*", nil)
		object.write(image.to_blob)
	end
end

def create_tiny object, bucket
	key = object.key
	if key.start_with?("hike-images/") and key.end_with?("-original.jpg")
		blob = object.read
		if blob.length > 0
			image = Magick::Image.from_blob(blob).first
			image = image.unsharp_mask(2, 0.5, 0.7, 0)
			if image.columns > image.rows
				image.resize_to_fit!(200)
			else
				image.resize_to_fit!(200, 400)
			end
			bucket.objects[key.chomp("-original.jpg") + "-tiny.jpg"].write(image.to_blob { self.quality = 87 })
		end
	end
end

def create_tiny_thumb object, bucket
	key = object.key
	if key.start_with?("hike-images/") and key.end_with?("-original.jpg")
		blob = object.read
		if blob.length > 0
			image = Magick::Image.from_blob(blob).first
			image = image.unsharp_mask(2, 0.5, 0.7, 0)
			image.crop_resized!(200, 200)
			bucket.objects[key.chomp("-original.jpg") + "-thumb-tiny.jpg"].write(image.to_blob { self.quality = 87 })
		end
	end
end

def update_photo_size object
	key = object.key
	if key.start_with?("hike-images/") and key.end_with?("-original.jpg")
		blob = object.read
		index_of_first_slash = key.index("/")
		id = key[index_of_first_slash + 1, key.length - index_of_first_slash]
		id.chomp! "-original.jpg"
		puts id
		if blob.length > 0
			image = Magick::Image.from_blob(blob).first
			puts database["UPDATE photos SET width=#{image.columns}, height=#{image.rows} WHERE string_id='#{id}';"].entries
		end
	end
end

def set_cache_control object
	key = object.key
	if key.start_with?("hike-images/") and key.end_with?(".jpg")
		puts "Setting cache control for #{key}"
		object.copy_to(key, :cache_control => "max-age=31556926")
	end
end

def trace object
	key = object.key
	puts key
end

def main
	bucket = s3.buckets["assets.hike.io"]
	bucket.objects.each do |object|
		trace object
		#strip_metadata object
		#create_tiny object, bucket
		#set_cache_control object
		#create_tiny_thumb object, bucket
		#update_photo_size object
	end
end

main