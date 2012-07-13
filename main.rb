require "rubygems"
require "sinatra"
require "sinatra/base" 
require "sinatra/content_for"

class Entry
	attr_accessor :id, :name, :pictures, :map

	def initialize(options)
		@id = options[:id]
		@name = options[:name]
		@pictures = options[:pictures]
		@map = options[:map]
	end
end

class Map
	attr_accessor :zoom_level, :longitude, :latitude

	def initialize(options)
		@zoom_level = options[:zoom_level]
		@longitude = options[:longitude]
		@latitude = options[:latitude]
	end
end

class Picture
	attr_accessor :id

	def initialize(options)
		@id = options[:id]
	end
end

helpers do

	#
	# TODO real database
	#

	def pictures
		[Picture.new({:id => "scotchmans-peak-trees"}),
		 Picture.new({:id => "scotchmans-peak-mountain-goat"}),
		 Picture.new({:id => "scotchmans-peak-dead-tree"}),
		 Picture.new({:id => "scotchmans-peak-goat-view"}),
		 Picture.new({:id => "scotchmans-peak-wildflower"}),
		 Picture.new({:id => "scotchmans-peak-zak"}),
		 Picture.new({:id => "scotchmans-peak-pend-orielle"})]
	end

	def map
		Map.new({:zoom_level => 8, :latitude => 47.315, :longitude => -121.730})
	end

	def popular_list
		return [Entry.new({:id => "scotchmans-peak", :name => "Scotchman's Peak", :pictures => pictures, :map => map}), 
    			Entry.new({:id => "king-arthurs-seat", :name => "King Arthur's Seat", :pictures => pictures, :map => map}),
    			Entry.new({:id => "north-kaibab-trail", :name => "North Kaibab Trail", :pictures => pictures, :map => map}),
    			Entry.new({:id => "mt-kilamanjaro", :name => "Mt. Kilamanjaro", :pictures => pictures, :map => map})]
	end

	def find_entry id
		popular_list.select { |entry|
			entry.id == id
		}[0]
	end	

end

not_found do
	redirect "/"
end

before do
	if settings.environment == :development
		@public_base_path = ""
	else
		@public_base_path = "http://assets.hike.io"
	end

	@entry_img_dir = "#{@public_base_path}/hike-img"
	@js_dir = "#{@public_base_path}/js"
	@css_dir = "#{@public_base_path}/css"
	@img_dir = "#{@public_base_path}/img"

end

get "/" do
	@title = "hike.io - Beautiful Hikes"
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