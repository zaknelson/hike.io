require "rubygems"
require "sinatra"
require "sinatra/sequel"

set :database, ENV["DATABASE_URL"] || "postgres://localhost/hikeio"

migration "create pg_trgm extension" do
	database.run "CREATE EXTENSION IF NOT EXISTS pg_trgm"
end

migration "create entries table" do
	database.create_table :entries do
		primary_key :id
		String :string_id,				:null => false, :unique => true
		String :name, 					:null => false
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

		unique [:latitude, :longitude]
	end
end

migration "create keywords table" do
	database.create_table :keywords do
		primary_key :id
		String :keyword, 				:null => false, :unique => true
	end
end

migration "create entries_photos table" do
	database.create_join_table(:entry_id => :entries, :photo_id => :photos)
end

migration "create entries_locations table" do
	database.create_join_table(:entry_id => :entries, :location_id => :locations)
end

migration "create entries_keywords table" do
	database.create_join_table(:entry_id => :entries, :keyword_id => :keywords)
end

class Entry < Sequel::Model
	many_to_many :photos
	many_to_many :locations
	many_to_many :keywords
end

class Photo < Sequel::Model
end

class Location < Sequel::Model
end

class Keyword < Sequel::Model
	many_to_many :entries
end