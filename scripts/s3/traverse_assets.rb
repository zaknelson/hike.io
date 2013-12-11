
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

def delete_abdandoned_photos_on_s3 bucket
	bucket = s3.buckets["assets.hike.io"]
	s3_photos = []
	i = 0
	bucket.objects.each do |object|
		#next if i > 5
		key = object.key
		if key.start_with?("hike-images/") and key.end_with?("-original.jpg")
			i += 1
			index_of_first_slash = key.index("/")
			id = key[index_of_first_slash + 1, key.length - index_of_first_slash]
			id.chomp! "-original.jpg"
			s3_photos.push(id)
		end
	end

	db_photos = [] # these are just the db photos that are assigned to hikes
	database["SELECT photos.string_id FROM hikes, photos where hikes.photo_facts_id=photos.id OR hikes.photo_landscape_id=photos.id OR hikes.photo_preview_id=photos.id"].entries.each do |photo|
		db_photos.push(photo[:string_id])
	end
	database["SELECT photos.string_id FROM hikes_photos, photos WHERE hikes_photos.photo_id=photos.id"].entries.each do |photo|
		db_photos.push(photo[:string_id])
	end

	diff = s3_photos - db_photos
	puts s3_photos.length
	puts db_photos.length
	puts diff.length
	puts diff

	#diff.each do |photo_id|
	#	bucket.objects["hike-images/" + photo_id + "-original.jpg"].delete
	#	bucket.objects["hike-images/" + photo_id + "-large.jpg"].delete
	#	bucket.objects["hike-images/" + photo_id + "-medium.jpg"].delete
	#	bucket.objects["hike-images/" + photo_id + "-small.jpg"].delete
	#	bucket.objects["hike-images/" + photo_id + "-tiny.jpg"].delete
	#	bucket.objects["hike-images/" + photo_id + "-thumb.jpg"].delete
	#	bucket.objects["hike-images/" + photo_id + "-thumb-tiny.jpg"].delete
	#end
end

def delete_photos_in_db_that_are_unassigned

	assigned_db_photos = [] # these are just the db photos that are assigned to hikes
	database["SELECT photos.string_id FROM hikes, photos where hikes.photo_facts_id=photos.id OR hikes.photo_landscape_id=photos.id OR hikes.photo_preview_id=photos.id ORDER BY photos.string_id"].entries.each do |photo|
		assigned_db_photos.push(photo[:string_id])
	end
	database["SELECT photos.string_id FROM hikes_photos, photos WHERE hikes_photos.photo_id=photos.id ORDER BY photos.string_id"].entries.each do |photo|
		assigned_db_photos.push(photo[:string_id])
	end

	all_db_photos = []
	database["SELECT string_id FROM photos ORDER BY string_id"].entries.each do |photo|
		all_db_photos.push(photo[:string_id])
	end

	diff = all_db_photos - assigned_db_photos

	puts all_db_photos.length
	puts assigned_db_photos.length
	puts diff.length
	puts diff
	diff.each do |photo_string_id|
		#puts database["DELETE FROM photos WHERE string_id='#{photo_string_id}'"].entries
	end
end

def replace_with_progressive_jpg object, bucket
	key = object.key
	if key.start_with?("hike-images/") and !key.end_with?("-original.jpg") and key.end_with?(".jpg")
		puts key
		File.open("before.jpg", 'w') { |file| file.write(object.read) }
	 	`convert before.jpg -interlace Plane after.jpg`
		object.write(Pathname.new("after.jpg"))
	end
end

def rename_thumb_to_thumb_small object, bucket
	key = object.key
	if key.start_with?("hike-images/") and key.end_with?("-thumb.jpg")
		puts key
		new_key = key.sub("thumb", "thumb-small")
		object.move_to(new_key)
	end
end

def trace object
	key = object.key
	puts key
end

def main
	bucket = s3.buckets["assets.hike.io"]
	#delete_abdandoned_photos_on_s3 bucket
	#delete_photos_in_db_that_are_unassigned
	bucket.objects.each do |object|
		trace object
		#rename_thumb_to_thumb_small object, bucket
		#replace_with_progressive_jpg object, bucket
		#strip_metadata object
		#create_tiny object, bucket
		#set_cache_control object
		#create_tiny_thumb object, bucket
		#update_photo_size object
	end
end

main