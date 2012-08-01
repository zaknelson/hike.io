require "rubygems"
require "sinatra"
require 'sinatra/assetpack'
require "sinatra/base" 
require "sinatra/content_for"

class Entry
	attr_accessor :id, :name, :location, :distance, :elevation_gain, :pictures, :map

	def initialize options
		@id = options[:id]
		@location = options[:location]
		@distance = options[:distance]
		@elevation_gain = options[:elevation_gain]
		@name = options[:name]
		@pictures = options[:pictures]
		@map = options[:map]
	end
end

class Map
	attr_accessor :zoom_level, :longitude, :latitude

	def initialize options
		@zoom_level = options[:zoom_level]
		@longitude = options[:longitude]
		@latitude = options[:latitude]
	end
end

class Picture
	attr_accessor :id

	def initialize options
		@id = options[:id]
	end
end

class HikeApp < Sinatra::Base

	#content_for
	helpers Sinatra::ContentFor

	#assetpack setup
	set :root, File.dirname(__FILE__)
	register Sinatra::AssetPack
	assets {
		prebuild true

		js :app, "/js/app.js", [
			"/js/*.js",
			"/js/lib/*.js"
		]

		css :app, "/css/app.css", [
			"/css/*.css",
			"/css/lib/*.css"
		]
	}

	helpers do

		def root
			File.dirname(__FILE__)
		end
		
		def pictures
			[Picture.new({:id => "scotchmans-peak-trees"}),
			 Picture.new({:id => "scotchmans-peak-mountain-goat"}),
			 Picture.new({:id => "scotchmans-peak-wildflower"}),
			 Picture.new({:id => "scotchmans-peak-meadow"}),
			 Picture.new({:id => "scotchmans-peak-pend-orielle"}),
			 Picture.new({:id => "scotchmans-peak-zak"}),
			 Picture.new({:id => "scotchmans-peak-mountain-goat-cliff"}),
			 Picture.new({:id => "scotchmans-peak-hikers"}),
			 Picture.new({:id => "scotchmans-peak-dead-tree"})]
		end

		def map
			Map.new({:zoom_level => 8, :latitude => 47.315, :longitude => -121.730})
		end

		def all_entries
			[Entry.new({
				:id => "scotchmans-peak", 
				:name => "Scotchman's Peak",
				:location => "North Idaho, USA", 
				:distance => 10,
				:elevation_gain => 1000,
				:pictures => pictures, 
				:map => map}),
			Entry.new({
				:id => "king-arthurs-seat", 
				:name => "King Arthur's Seat", 
				:location => "Edinburgh, Scotland", 
				:distance => 3,
				:elevation_gain => 1000,
				:pictures => pictures, 
				:map => map}),
			Entry.new({
				:id => "north-kaibab-trail", 
				:name => "North Kaibab Trail", 
				:location => "Grand Canyon, USA", 
				:distance => 15,
				:elevation_gain => 1000,
				:pictures => pictures, 
				:map => map}),
			Entry.new({
				:id => "lake-22", 
				:name => "Lake 22", 
				:location => "Washington, USA", 
				:distance => 18,
				:elevation_gain => 2500,
				:pictures => pictures, 
				:map => map}),
			Entry.new({
				:id => "pikes-peak", 
				:name => "Pike's Peak", 
				:location => "Colorado, USA", 
				:distance => 30,
				:elevation_gain => 3000,
				:pictures => pictures, 
				:map => map}),
			Entry.new({
				:id => "snoqualmie-middle-fork", 
				:name => "Snoqualmie Middle Fork", 
				:location => "Washington, USA", 
				:distance => 11,
				:elevation_gain => 4352,
				:pictures => pictures, 
				:map => map}),
			Entry.new({:id => "mt-kilamanjaro", 
				:location => "North Idaho, USA", 
				:name => "Mt. Kilamanjaro", 
				:location => "Tanzania", 
				:distance => 50,
				:elevation_gain => 1000,
				:pictures => pictures, 
				:map => map})]
		end

		def featured_entry 
			all_entries[0];
		end

		def popular_list
			all_entries[1..-1]
		end

		def find_entry id
			all_entries.select { |entry|
				entry.id == id
			}[0]
		end

		def distance_string distance
			# Distance is in km (that's right).
			miles = (distance * 0.621371).round(1)
			"#{miles} mi."
		end

		def elevation_string elevation
			feet = (elevation * 3.28084).round(0)
			"#{feet} ft."
		end

		# Assumes the svg file has already passed through the process_svg script
		def render_svg(path, attributes=nil)

			render_str = ""

			if supports_svg?
				render_str = File.open("#{root}/app/#{path}", "rb").read
			else
				# Remove the extension
				arr = path.split(".")
				arr.pop

				# Assumes we have a backup png
				path = arr.join(".") + ".png"

				render_str = img path;
			end

			# Add any attributes provided
			if attributes
				attr_str = ""
				attributes.each { |key, value|
					attr_str += "#{key}=\"#{value}\" "
				}
				render_str.insert(4, " #{attr_str}");
			end

			render_str
		end

		def supports_svg?

			# Naughty, naughty, sniffing the user agent. I'm not happy with any of the polyfills, 
			# and really would like to use svgs for icons, so it must be done.
			ua = request.user_agent
			not (ua.include? "Android 2" or 
				 ua.include? "MSIE 6" 	 or 
				 ua.include? "MSIE 7" 	 or 
				 ua.include? "MSIE 8")
		end

	end

	before do
		if settings.environment == :development
			@entry_img_dir = "/hike-images"
		else
			@entry_img_dir = "http://assets.hike.io/hike-images"
		end

		@img_dir = "/images"
	end

	get "/" do
		@title = "hike.io - Beautiful Hikes"
		@featured_entry = featured_entry
		@popular_entry_list = popular_list
		erb :index
	end

	get "/:entry_id", :provides => 'html' do
		@entry = find_entry params[:entry_id]
		puts  params[:entry_id]
		pass unless @entry
		@title = @entry.name
		erb :entry
	end

	 # start the server if ruby file executed directly
	run! if app_file == $0
end