require "rubygems"
require "sinatra"
require "sinatra/sequel"

Sequel::Model.plugin :json_serializer, :naked => true

set :database, ENV["DATABASE_URL"] || "postgres://localhost/hikeio"

migration "create pg_trgm extension" do
	database.run "CREATE EXTENSION IF NOT EXISTS pg_trgm"
end

migration "create hikes table" do
	database.create_table :hikes do
		primary_key :id
		String :string_id,				:null => false, :unique => true
		String :name, 					:null => false
		String :description 			#optional
		Float :distance, 				:null => false
		Float :elevation_gain,			:null => false
		Time :creation_time, 			:null => false
		Time :edit_time, 				:null => false

		index :string_id
	end
end

migration "create photos table" do
	database.create_table :photos do
		primary_key :id
		String :path, 					:null => false, :unique => true
		String :alt						#optional 
	end
end

migration "create location table" do
	database.create_table :locations do
		primary_key :id
		String :name,					:null => false
		Float :latitude,				:null => false
		Float :longitude,				:null => false
		String :map_href,				:null => false
		String :map_image				#optional

		unique [:latitude, :longitude]
	end
end

migration "create keywords table" do
	database.create_table :keywords do
		primary_key :id
		String :keyword, 				:null => false, :unique => true
	end
end

migration "create hikes_photos table" do
	database.create_join_table(:hike_id => :hikes, :photo_id => :photos)
end

migration "create hikes_locations table" do
	database.create_join_table(:hike_id => :hikes, :location_id => :locations)
end

migration "create hikes_keywords table" do
	database.create_join_table(:hike_id => :hikes, :keyword_id => :keywords)
end

class Hike < Sequel::Model
	many_to_many :photos
	many_to_many :locations
	many_to_many :keywords
end

class Photo < Sequel::Model
end

class Location < Sequel::Model
end

class Keyword < Sequel::Model
	many_to_many :hikes
end