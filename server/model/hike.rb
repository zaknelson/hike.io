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
		hike = Hike.create(
			:string_id => Hike.create_string_id_from_name(json["name"]),
			:name => json["name"],
			:locality => json["locality"],
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
		name.downcase.split(" ").join("-")
	end

	def update_keywords
		keywords = KeywordUtils.sanitize_to_keywords(name)
		keywords.each do |keyword|
			add_keyword(Keyword.find_or_create(:keyword => keyword))
		end
	end
end