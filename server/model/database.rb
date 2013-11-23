require "rubygems"
require "sinatra"
require "sinatra/sequel"
require "uuidtools"

Sequel::Model.plugin :json_serializer, :naked => true

set :database, ENV["DATABASE_URL"] || "postgres://localhost/hikeio"

migration "create pg_trgm extension" do
	database.run "CREATE EXTENSION IF NOT EXISTS pg_trgm"
end

migration "create users table" do
	database.create_table :users do
		String :id,								:null => false, :unique => true
	end
end

migration "create photos table" do
	database.create_table :photos do
		primary_key :id
		String :string_id, 						:null => false, :unique => true
		Integer :width							#:null => false
		Integer :height							#:null => false
		String :alt								#optional 
	end
end

migration "create locations table" do
	database.create_table :locations do
		primary_key :id
		Float :latitude,						:null => false
		Float :longitude,						:null => false
	end
end

migration "create maps table" do
	database.create_table :maps do
		primary_key :id
		String :image_path, 					:null => false, :unique => true
	end
end

migration "create keywords table" do
	database.create_table :keywords do
		primary_key :id
		String :keyword, 						:null => false, :unique => true
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
		Float :elevation_gain				#optional
		Float :elevation_max				#optional
		Time :creation_time, 				:null => false
		Time :edit_time, 					:null => false

		foreign_key :location_id, :locations
		foreign_key :photo_facts_id, :photos
		foreign_key :photo_landscape_id, :photos
		foreign_key :photo_preview_id, :photos

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

# Cached static HTML of site's url's, for SEO only
migration "create static_html table" do
	database.create_table :static_htmls do
		primary_key :id
		String :path, 						:null => false, :unique => true
		String :html, 						:null => false
		Time :fetch_time, 					:null => false
	end
end

# TODO, revisit this
migration "create reviews table" do
	database.create_table :reviews do
		primary_key :id
		String :string_id,						:null => false, :unique => true
		String :status,							:null => false
		String :api_verb,						:null => false
		String :api_body						#optional
		Time :creation_time,					:null => false
		Time :edit_time,						:null => false
		String :hike_string_id # This is actually a foreign key into the Hike table, but the Hike may not yet exist because of the reviewal process
		foreign_key :reviewer, :users, :key => :id, :type => String
		foreign_key :reviewee, :users, :key => :id, :type => String

		index :id
	end
end

migration "add permits column 11/22/2013" do
	database.alter_table :hikes do
		add_column :permit, String
	end
end