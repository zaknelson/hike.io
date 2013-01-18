require "rubygems"
require "sinatra"
require "sinatra/sequel"

Sequel::Model.plugin :json_serializer, :naked => true

set :database, ENV["DATABASE_URL"] || "postgres://localhost/hikeio"

migration "create pg_trgm extension" do
	database.run "CREATE EXTENSION IF NOT EXISTS pg_trgm"
end

migration "create photos table" do
	database.create_table :photos do
		primary_key :id
		String :path, 					:null => false, :unique => true
		String :alt						#optional 
	end
end

migration "create locations table" do
	database.create_table :locations do
		primary_key :id
		Float :latitude,				:null => false
		Float :longitude,				:null => false

		unique [:latitude, :longitude]
	end
end

migration "create maps table" do
	database.create_table :maps do
		primary_key :id
		String :image_path, 			:null => false, :unique => true
	end
end

migration "create keywords table" do
	database.create_table :keywords do
		primary_key :id
		String :keyword, 				:null => false, :unique => true
	end
end

migration "create hikes table" do
	database.create_table :hikes do
		primary_key :id
		String :string_id,					:null => false, :unique => true
		String :name, 						:null => false
		String :description 				#optional
		String :locality,					:null => false
		Float :distance, 					:null => false
		Float :elevation_gain,				:null => false
		Time :creation_time, 				:null => false
		Time :edit_time, 					:null => false

		foreign_key :location_id, :locations

		index :string_id
	end
end

migration "create hikes_photos table" do
	database.create_join_table(:hike_id => :hikes, :photo_id => :photos)
end

migration "create hikes_maps table" do
	database.create_join_table(:hike_id => :hikes, :map_id => :maps)
end

migration "create hikes_locations table" do
	database.create_join_table(:hike_id => :hikes, :location_id => :locations)
end

migration "create hikes_keywords table" do
	database.create_join_table(:hike_id => :hikes, :keyword_id => :keywords)
end

class Hike < Sequel::Model
	many_to_many :photos
	many_to_many :maps
	many_to_many :keywords
	many_to_one :location

	def to_json *a
		super :include => { :location => { :except => :id } }, :except => :location_id
	end

	def from_json (json, opts={})
		parsed_json = JSON.parse(json)
		if parsed_json["location"]
			location_hash = parsed_json["location"].symbolize_keys.to_hash
			if self.location.hikes.length == 1 && parsed_json["location"] != self.location
				self.location = Location.find_or_create(location_hash)
			end
			parsed_json.delete "location"
		end
		if opts[:fields]
			set_fields(parsed_json, opts[:fields], opts)
		else
			set(parsed_json)
		end
	end
end

class Photo < Sequel::Model
end

class Location < Sequel::Model
	one_to_many :hikes
end

class Map < Sequel::Model
end

class Keyword < Sequel::Model
	many_to_many :hikes
end