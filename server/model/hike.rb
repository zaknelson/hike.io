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
			:edit_time => Time.now
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
		Sanitize.clean(str)
	end

	def self.clean_anchor_input html
		return html if not html
		Sanitize.clean(html, 
			:add_attributes => {
				"a" => {"rel" => "nofollow"}
			},
			:elements => ["a"],
			:attributes => { "a" => ["href"] })
	end

	def self.clean_html_input html
		return html if not html
		# The html that comes in from contenteditable is pretty unweidly, try to clean it up
		inputToReplaceMapping = {
			"<div>"		=> "\n",
			"</div>"	=> "\n",
			"<br>"		=> "\n",
			"<br/>"		=> "\n",
			"</br>"		=> "\n",
			"<p>"		=> "\n",
			"</p>"		=> "\n",
			"<strong>"	=> "<b>",
			"</strong>"	=> "</b>",
			"<em>"		=> "<i>",
			"</em>"		=> "</i>",
			"&nbsp;"	=> "",

			'href="http://hike.io'	=> 'href="',
			'href="hike.io'			=> 'href="'
		}
		html.gsub! /(<div>|<\/div>|<div\/>|<br>|<br\/>|<\/br>|<p>|<\/p>|<p\/>|<strong>|<\/strong>|<em>|<\/em>|&nbsp;|href="http:\/\/hike\.io|href="hike\.io)/i do |match|
			inputToReplaceMapping[match.to_s]
		end
		cleaned_html = ""
		html_elements = html.split("\n")
		html_elements.each do |element|
			element.strip!
			next if element.length == 0
			if element.start_with?("<h3>") || element.end_with?("</h3>")
				cleaned_html += element
			else
				cleaned_html += "<p>" + element + "</p>"
			end
		end

		Sanitize.clean(cleaned_html, 
			:add_attributes => {
				"a" => {"rel" => "nofollow"}
			},
			:elements => ["h3", "b", "i", "p", "a"],
			:attributes => { "a" => ["href"] },
			:transformers => lambda do |env|
				# Remove rel=nofollow on relative links
				node = env[:node]
				node_name = env[:node_name]
				return unless node_name == "a"
				return unless node["href"].start_with?("/")
				Sanitize.clean_node!(node, {
					:elements => ["a"],
					:attributes => { "a" => ["href"] }
				})
				{ :node_whitelist => [node] }
			end)
	end

	def update_from_json json
		previous_name = self.name

		self.name = Hike.clean_string_input(json["name"])
		self.update_keywords if json["name"] != previous_name
		self.description = Hike.clean_html_input(json["description"])
		self.distance = json["distance"]
		self.elevation_gain = json["elevation_gain"]
		self.elevation_max = json["elevation_max"]
		self.locality = Hike.clean_string_input(json["locality"])
		self.permit = Hike.clean_anchor_input(json["permit"])
		self.location.latitude = json["location"]["latitude"]
		self.location.longitude = json["location"]["longitude"]

		if json["string_id"] && self.string_id != json["string_id"]
			self.string_id = json["string_id"]
			all_photos.each do |photo|
				photo.move_on_s3(self)
			end
			# TODO update the static_html and review tables?
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

	def self.is_valid_json? json
		json["name"] &&
			json["locality"] &&
			json["distance"] &&
			json["elevation_gain"] &&
			json["elevation_max"] &&
			json["location"] && 
			json["location"]["latitude"] &&
			json["location"]["longitude"] &&
			StringUtils.is_numeric?(json["distance"]) &&
			StringUtils.is_numeric?(json["elevation_gain"]) &&
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