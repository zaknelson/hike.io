require "rubygems"
require "sinatra"
require "sinatra/base" 
require "sinatra/content_for"

class Entry
	attr_accessor :id, :main_image, :name, :thumbs, :map

	def initialize(options)
		@id = options[:id]
		@main_image = options[:main_image]
		@name = options[:name]
		@thumbs = options[:thumbs]
		@map = options[:map]
	end
end

class Thumb
	attr_accessor :image, :width, :height

	def initialize(options)
		@image = options[:image]
		@width = options[:width]
		@height = options[:height]
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

helpers do

	#
	# TODO real database
	#

	def thumbs
		[Thumb.new({:image => "scotchmans-peak-trees-thumb.jpg", :width => 338, :height => 224}), 
		 Thumb.new({:image => "scotchmans-peak-mountain-goat-thumb.jpg", :width => 338, :height => 224}),
		 Thumb.new({:image => "scotchmans-peak-dead-tree-thumb.jpg", :width => 338, :height => 509}),
		 Thumb.new({:image => "scotchmans-peak-goat-view-thumb.jpg", :width => 338, :height => 224}),
		 Thumb.new({:image => "scotchmans-peak-wildflower-thumb.jpg", :width => 338, :height => 224}),
		 Thumb.new({:image => "scotchmans-peak-zak-thumb.jpg", :width => 338, :height => 224}),
		 Thumb.new({:image => "scotchmans-peak-pend-orielle-thumb.jpg", :width => 338, :height => 125})]
	end

	def map
		Map.new({:zoom_level => 8, :latitude => 47.315, :longitude => -121.730})
	end

	def popular_list

		return [Entry.new({:id => "scotchmans-peak", :main_image => "scotchmans-peak.jpg", :name => "Scotchman's Peak", :thumbs => thumbs, :map => map}), 
    			Entry.new({:id => "king-arthurs-seat", :main_image => "king-arthurs-seat.jpg", :name => "King Arthur's Seat", :thumbs => thumbs, :map => map}),
    			Entry.new({:id => "north-kaibab-trail", :main_image => "north-kaibab-trail.jpg", :name => "North Kaibab Trail", :thumbs => thumbs, :map => map}),
    			Entry.new({:id => "mt-kilamanjaro", :main_image => "mt-kilamanjaro.jpg", :name => "Mt. Kilamanjaro", :thumbs => thumbs, :map => map})]
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

	@hike_images_path = "#{@public_base_path}/hike-images"
end

get "/" do
	@title = "hike.io - Beautiful Hikes"
	@preview_list = popular_list
	erb :index
end

get "/hikes/:hike_id" do
	@entry = find_entry params[:hike_id]
	redirect "/" unless @entry
	@title = @entry.name
	erb :entry
end