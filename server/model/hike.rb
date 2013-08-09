class Hike < Sequel::Model
	
	many_to_many :maps
	many_to_many :keywords
	many_to_one  :location
	many_to_one  :photo_facts, :class => :Photo
	many_to_one  :photo_landscape, :class => :Photo
	many_to_one  :photo_preview, :class => :Photo
	many_to_many :photos_generic, :class => :Photo, :left_key => :hike_id, :right_key => :photo_id, :join_table => :hikes_photos

	def to_json *a
		super :include => { 
				:location => {},
				:photo_facts => {},
				:photo_landscape => {},
				:photo_preview => {},
				:photos_generic => {}
			}, 
			:except => [:location_id, :photo_facts_id, :photo_landscape_id, :photo_preview_id]
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
		html.gsub!(/(<div>|<\/div>|<div\/>|<br>|<br\/>|<p>|<\/p>|<p\/>|<h3>|<\/h3>)/i, "\n")
		html.gsub!("&nbsp;", "")
		cleaned_html = ""
		paragraphs = html.split("\n")
		paragraphs.each do |p|
			next if p.length == 0
			p = p.strip
			if p[p.length - 1] != "." # HACK, until a better ui is developed for adding headers
				cleaned_html += "<h3>" + p.strip + "</h3>"
			else
				cleaned_html += "<p>" + p.strip + "</p>"
			end
		end
		Sanitize.clean(cleaned_html, :elements => ["p", "h3"])
	end

	def update_from_json json
		self.name = Hike.clean_string_input(json["name"])
		self.description = Hike.clean_html_input(json["description"])
		self.distance = json["distance"]
		self.elevation_max = json["elevation_max"]
		self.locality = Hike.clean_string_input(json["locality"])
		self.location.latitude = json["location"]["latitude"]
		self.location.longitude = json["location"]["longitude"]
	end

	def update_keywords
		keywords = KeywordUtils.sanitize_to_keywords(name)
		keywords.each do |keyword|
			add_keyword(Keyword.find_or_create(:keyword => keyword))
		end
	end

	def each_photo
		yield "photo_facts"
		yield "photo_landscape"
		yield "photo_preview"
	end

end