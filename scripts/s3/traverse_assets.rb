require "rubygems"
require "aws-sdk"
require "RMagick"

def s3
	@s3 = @s3 || AWS::S3.new(
		:access_key_id     => ENV["S3_ACCESS_KEY_ID"],
		:secret_access_key => ENV["S3_SECRET_ACCESS_KEY"]
	)
	@s3
end

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

def trace object
	puts object.key
end

def main
	bucket = s3.buckets["assets.hike.io"]
	bucket.objects.each do |object|
		#strip_metadata object
		#create_tiny object, bucket
		#trace object
		create_tiny_thumb object, bucket
	end
end

main