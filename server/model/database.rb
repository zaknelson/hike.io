require "rubygems"
require "sinatra"
require "sinatra/sequel"

migration "create entries table" do
	database.create_table :entries do
		primary_key :id
		string :string_id,				:null => false, :unique => true
		string :name, 					:null => false
		float :distance, 				:null => false
		float :elevation_gain,			:null => false
		time :creation_time, 			:null => false
		time :edit_time, 				:null => false

		index :string_id
	end
end

migration "create photos table" do
	database.create_table :photos do
		primary_key :id
		string :path, 					:null => false, :unique => true
		string :alt						#optional 
	end
end

migration "create entries_photos table" do
	database.create_table :entries_photos do
		primary_key :id
		foreign_key :entry_id,			:null => false
		foreign_key :photo_id,			:null => false

		index :entry_id
	end
end

migration "create location table" do
	database.create_table :locations do
		primary_key :id
		string :name,					:null => false
		float :latitude,				:null => false
		float :longitude,				:null => false
		string :map_href,				:null => false

		unique [:latitude, :longitude]
	end
end

migration "create entries_locations table" do
	database.create_table :entries_locations do
		primary_key :id
		foreign_key :entry_id, :entries,			:null => false # Do we need table names here?
		foreign_key :location_id, :locations,		:null => false

		index :entry_id
	end
end

class Entry < Sequel::Model
	many_to_many :photos
	many_to_many :locations
end

class Photo < Sequel::Model
end

class Location < Sequel::Model
end

#class Entry_Location < Sequel::Model(:entries_locations)
#end