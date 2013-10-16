class Hike < Sequel::Model
	
	many_to_many :maps
	many_to_many :keywords
	many_to_one  :location
	many_to_one  :photo_facts, :class => :Photo
	many_to_one  :photo_landscape, :class => :Photo
	many_to_one  :photo_preview, :class => :Photo
	many_to_many :photos_generic, :class => :Photo, :left_key => :hike_id, :right_key => :photo_id, :join_table => :hikes_photos

	def as_json fields=nil
		if fields
			options = {:only => fields}
		else
			options = {
				:except => [:location_id, :photo_facts_id, :photo_landscape_id, :photo_preview_id],
				:include => { 
					:location => {},
					:photo_facts => {},
					:photo_landscape => {},
					:photo_preview => {},
					:photos_generic => {}
				}
			}
		end
		to_json(options)
	end

	def self.create_from_json json
		name = Hike.clean_string_input(json["name"])
		hike = Hike.create(
			:string_id => Hike.create_string_id_from_name(name),
			:name => name,
			:locality => Hike.clean_string_input(json["locality"]),
			:distance => json["distance"],
			:elevation_max => json["elevation_max"],
			:creation_time => Time.now,
			:edit_time => Time.now
			);
		hike.location = Location.create(
			:latitude => json["location"]["latitude"],
			:longitude => json["location"]["longitude"]
			);
		hike.update_keywords
		hike.save
		hike
	end

	def self.create_string_id_from_name name
		id = name.gsub("#", "");
		id.downcase.split(" ").join("-")
	end

	def self.clean_string_input str
		Sanitize.clean(str)
	end

	def self.clean_html_input html
		return html if not html
		# The html that comes in from contenteditable is pretty unweidly, try to clean it up
		# TODO this code is inefficient
		html.gsub!(/(<div>|<\/div>|<div\/>|<br>|<br\/>|<p>|<\/p>|<p\/>)/i, "\n")
		html.gsub!("&nbsp;", "")
		html.gsub!('href="javascript:void"', "")
		html.gsub!("data-href", "href")
		cleaned_html = ""
		html_elements = html.split("\n")
		html_elements.each do |element|
			element.strip!
			next if element.length == 0
			if ((element.start_with?("<h3>") && element.end_with?("</h3>")) ||
				(element.start_with?("<blockquote>") && element.end_with?("</blockquote>")))
				cleaned_html += element
			else
				cleaned_html += "<p>" + element + "</p>"
			end
		end
		Sanitize.clean(cleaned_html, 
			:elements => ["h3", "b", "i", "blockquote", "p", "a"],
			:attributes => { "a" => ["href"] },
			:protocols => { "a" => { "href" => [:relative]}})
	end

	def update_from_json json
		self.update_keywords if json["name"] != self.name

		self.name = Hike.clean_string_input(json["name"])
		self.description = Hike.clean_html_input(json["description"])
		self.distance = json["distance"]
		self.elevation_max = json["elevation_max"]
		self.locality = Hike.clean_string_input(json["locality"])
		self.location.latitude = json["location"]["latitude"]
		self.location.longitude = json["location"]["longitude"]

		removed_photos = []
		Hike.each_photo_type do |photo_key|
			existing_photo = self.send(photo_key)
			if json[photo_key] != nil
				new_photo = Photo.find(:id => json[photo_key]["id"])
				self.send "#{photo_key}=", new_photo
				new_photo.move_on_s3_if_needed(self)
			elsif existing_photo
				removed_photos.push existing_photo
				self.send "#{photo_key}=", nil
			end
		end

		if json["photos_generic"]
			new_generic_photos = []
			json["photos_generic"].each do |photo|
				photo = Photo.find(:id => photo["id"])
				new_generic_photos.push(photo) if photo
			end

			added_generic_photos = new_generic_photos - self.photos_generic
			removed_generic_photos = self.photos_generic - new_generic_photos

			added_generic_photos.each do |photo|
				self.add_photos_generic(photo)
				photo.move_on_s3_if_needed(self)
			end

			removed_photos += removed_generic_photos
			
			removed_generic_photos.each do |photo|
				self.remove_photos_generic(photo)
			end
		end

		self.edit_time = Time.now
		self.location.save_changes
		self.save_changes
		
		removed_photos.each do |photo|
			photo.delete
			if settings.production?
				bucket = AmazonUtils.s3.buckets["assets.hike.io"]
				src = "hike-images/" + photo.string_id
				dst = "hike-images/tmp/deleted/" + photo.string_id
				Photo.each_rendition do |rendition|
					suffix = Photo.get_rendition_suffix(rendition)
					bucket.objects[src + suffix].move_to(dst + suffix)
				end
			end
		end
	end

	def update_keywords
		keywords = KeywordUtils.sanitize_to_keywords(name)
		keywords.each do |keyword|
			add_keyword(Keyword.find_or_create(:keyword => keyword))
		end
	end

	def self.each_photo_type
		yield "photo_facts"
		yield "photo_landscape"
		yield "photo_preview"
	end

	def self.is_valid_json? json
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

	def self.is_valid_latitude? latitude
		latitude = latitude.to_f
		latitude >= -90 and latitude <= 90
	end

	def self.is_valid_longitude? longitude
		longitude = longitude.to_f
		longitude >= -180 and longitude <= 180
	end

end