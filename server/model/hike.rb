require_relative "../controller/sanitizer"

class Hike < Sequel::Model
	
	many_to_many :maps
	many_to_many :keywords
	many_to_one  :location
	many_to_one  :photo_facts, :class => :Photo
	many_to_one  :photo_landscape, :class => :Photo
	many_to_one  :photo_preview, :class => :Photo
	many_to_many :photos_generic, :class => :Photo, :left_key => :hike_id, :right_key => :photo_id, :join_table => :hikes_photos

	def jsonify_route_field json
		return json if not self.route
		field_separator = ""
		if (json.length != 2)
			# If the result is longer than 2, then that means there are multiple fields being returned, and we need a comma, did I mention this was ugly?
			field_separator = ","
		end
		json.chomp("}") + field_separator + '"route":' + self.route + "}"
end

	def as_json fields=nil
		if fields
			has_route_field = fields.delete("route")
			options = {:only => fields}
			result = to_json(options)
			# Ugly, but have to specical case route field since it is stored as json
			if (has_route_field)
				result = jsonify_route_field(result)
			end
			result
		else
			options = {
				:except => [:location_id, :photo_facts_id, :photo_landscape_id, :photo_preview_id, :route],
				:include => { 
					:location => {},
					:photo_facts => {},
					:photo_landscape => {},
					:photo_preview => {},
					:photos_generic => {}
				}
			}
			result = to_json(options)
			jsonify_route_field(result)
		end
	end

	def self.get_hike_from_id hike_id
		hike = Hike[:string_id => hike_id]
		if not hike and StringUtils.is_integer? hike_id
			hike = Hike[:id => Integer(hike_id)]
		end
		hike
	end

	def self.create_from_json json
		name = Hike.clean_string_input(json["name"])
		string_id = Hike.create_string_id_from_name(name)
		hike = Hike.create(
			:string_id => string_id,
			:name => name,
			:locality => Hike.clean_string_input(json["locality"]),
			:distance => json["distance"],
			:elevation_gain => json["elevation_gain"],
			:elevation_max => json["elevation_max"],
			:creation_time => Time.now,
			:edit_time => Time.now,
			:route => json["route"] ? Hike.clean_string_input(json["route"].to_json) : nil # Route is optional at creation time
			);
		hike.location = Location.create(
			:latitude => json["location"]["latitude"],
			:longitude => json["location"]["longitude"]
			);
		hike.update_keywords
		hike.save
		StaticHtml.get_and_update_for_path("/hikes/" + string_id)
		hike
	end

	def self.create_string_id_from_name name
		id = name.gsub(/[^0-9a-z ]/i, "")
		id.downcase.split(" ").join("-")
	end

	def self.clean_string_input str
		Sanitizer.clean_string(str)
	end

	def self.clean_anchor_input html
		Sanitizer.clean_anchor(html)
	end

	def self.clean_html_input html
		Sanitizer.clean_html(html)
	end

	def self.clean_json json
		json["name"] = Hike.clean_string_input(json["name"])
		json["description"] = Hike.clean_html_input(json["description"])
		json["locality"] = Hike.clean_string_input(json["locality"])
		json["permit"] = Hike.clean_anchor_input(json["permit"])
	end

	def update_from_json json
		previous_name = self.name

		Hike.clean_json(json)
		self.name = json["name"]
		self.update_keywords if json["name"] != previous_name
		self.description = json["description"]
		self.distance = json["distance"]
		self.elevation_gain = json["elevation_gain"]
		self.elevation_max = json["elevation_max"]
		self.locality = json["locality"]
		self.permit = json["permit"]
		self.location.latitude = json["location"]["latitude"]
		self.location.longitude = json["location"]["longitude"]

		if json["string_id"] && self.string_id != json["string_id"]
			self.string_id = json["string_id"]
			all_photos.each do |photo|
				photo.move_on_s3(self)
			end
			# TODO update the static_html and review tables?
		end

		if json["route"]
			self.route = Hike.clean_string_input(json["route"].to_json)
		else
			self.route = nil
		end
		
		removed_photos = []
		Hike.each_special_photo_key do |photo_key|
			existing_photo = self.send(photo_key)
			if json[photo_key] != nil
				new_photo = Photo.find(:id => json[photo_key]["id"])
				next if !new_photo 
				new_photo.update_from_json(json[photo_key])
				self.send "#{photo_key}=", new_photo
				new_photo.move_on_s3(self) if new_photo.is_in_tmp_folder_on_s3?
				removed_photos.push(existing_photo) if existing_photo && existing_photo != new_photo
			elsif existing_photo
				removed_photos.push existing_photo
				self.send "#{photo_key}=", nil
			end
		end

		if json["photos_generic"]
			new_generic_photos = []
			json["photos_generic"].each do |photo_json|
				photo = Photo.find(:id => photo_json["id"])
				photo.update_from_json(photo_json)
				new_generic_photos.push(photo) if photo
			end

			added_generic_photos = new_generic_photos - self.photos_generic
			removed_generic_photos = self.photos_generic - new_generic_photos

			added_generic_photos.each do |photo|
				self.add_photos_generic(photo)
				photo.move_on_s3(self) if photo.is_in_tmp_folder_on_s3?
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
			photo.destroy_and_move_on_s3
		end

		StaticHtml.get_and_update_for_path("/hikes/" + self.string_id)
	end

	def update_keywords
		previous_keywords = self.keywords
		self.remove_all_keywords
		self.save_changes
		previous_keywords.each { |k| k.destroy if k.hikes.length == 0 }

		new_keywords = KeywordUtils.sanitize_to_keywords(self.name)
		new_keywords.uniq!
		new_keywords.each do |keyword|
			add_keyword(Keyword.find_or_create(:keyword => keyword))
		end
	end

	def cascade_destroy
		# Store current values
		location = self.location
		keywords = self.keywords
		photos = self.all_photos
		static_html = StaticHtml[:path => "/hikes/#{self.string_id}"]

		# Remove all references from hike to remove foreign key constraints
		self.location = nil
		self.remove_all_keywords
		self.remove_all_photos_generic
		Hike.each_special_photo_key do |photo_key|
			self.send "#{photo_key}=", nil
		end
		self.save_changes
		
		# Destroy downstream objects if they are not referenced elsewhere
		location.destroy if location 
		static_html.destroy if static_html
		keywords.each { |k| k.destroy if k.hikes.length == 0 }
		photos.each do |photo|
			photo.destroy_and_move_on_s3
		end

		self.destroy
	end

	def self.each_special_photo_key
		yield "photo_facts"
		yield "photo_landscape"
		yield "photo_preview"
	end

	def all_photos
		photos = []
		photos.push self.photo_facts if self.photo_facts
		photos.push self.photo_landscape if self.photo_landscape
		photos.push self.photo_preview if self.photo_preview
		photos += self.photos_generic
		photos
	end

	def self.validate_json_fields json
		error = nil
		if !json["name"]
			error = "Name is a required field."
		elsif !json["locality"]
			error = "Location is a required field." # A bit hacky, on the front end, we call the locality field, location.
		elsif !json["distance"] || !StringUtils.is_numeric?(json["distance"])
			error = "Distance must be a number."
		elsif !json["elevation_gain"] || !StringUtils.is_numeric?(json["elevation_gain"])
			error = "Elevation gain must be a number."
		elsif !json["elevation_max"] || !StringUtils.is_numeric?(json["elevation_max"])
			error = "Elevation max must be a number."
		elsif !json["location"] || !json["location"]["latitude"] || !StringUtils.is_numeric?(json["location"]["latitude"]) || !is_valid_latitude?(json["location"]["latitude"])
			error = "Latitude must be a number between -90 and 90."
		elsif !json["location"]["longitude"] || !StringUtils.is_numeric?(json["location"]["longitude"]) || !is_valid_longitude?(json["location"]["longitude"])
			error = "Longitude must be number between -180 and 180."
		end
		error
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