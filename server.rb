#! /usr/bin/ruby

require "rubygems"

require "compass"
require "sass"
require "sinatra"
require "sinatra/base" 
require "sinatra/assetpack"
require "sinatra/content_for"
require "sinatra/partial"
require "will_paginate"
require "will_paginate/sequel"

require_relative "server/controller/search"
require_relative "server/model/database"
require_relative "server/view/localize"

configure :production do
	require "newrelic_rpm"
end

configure :development do
	require_relative "server/model/seeds"
end

class HikeApp < Sinatra::Base

	set :root, File.dirname(__FILE__)

	# will_paginate setup
	register WillPaginate::Sinatra

	# sinatra-partial setup
	register Sinatra::Partial
	set :partial_template_engine, :erb

	# Sass setup 
	set :sass, Compass.sass_engine_options
	set :sass, { :load_paths => sass[:load_paths] + [ "#{HikeApp.root}/app/css" ] }
	set :scss, sass

	# content_for setup
	helpers Sinatra::ContentFor

	# AssetPack setup
	register Sinatra::AssetPack

	# Compass setup
	Compass.configuration do |config|
		config.project_path = File.dirname(__FILE__)
		config.sass_dir = "#{HikeApp.root}/app/css" 
	end

	assets {
		prebuild true

		js :app, "/js/app.js", [
			"/js/layout.js",
			"/js/*.js",
			"/js/lib/*.js"
		]

		css :app, "/css/app.css", [
			"/css/reset.css",
			"/css/*.css",
			"/css/lib/*.css"
		]

		js_compression  :jsmin
   		css_compression :sass
	}

	helpers do

		def root
			File.dirname(__FILE__)
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

		def is_iPhone?
			request.user_agent.include? "iPhone"
		end

	end

	before do
		if settings.environment == :development
			@entry_img_dir = "/hike-images"
			@landing_page_img_dir = "/landing-page-images"
		else
			@entry_img_dir = "http://assets.hike.io/hike-images"
			@landing_page_img_dir = "http://assets.hike.io/landing-page-images"
		end

		@img_dir = "/images"
		@title = "hike.io"
	end


	#
	# Routes
	#

	get "/", :provides => "html" do
		if (params["q"])
			@query = params["q"]

			search_executor = SearchExecutor.new
			search_executor.query = @query
			@best_entry = search_executor.execute

			if @best_entry
				redirect "/#{@best_entry.string_id}"
			else 
				@title = "Unable to find hike for #{@query}"
				erb :search
			end
			
		else
			@hide_search_header = true
			@hide_main_container = true
			@title = "hike.io - Find beautiful hikes"
			erb :index
		end
	end

	get "/discover", :provides => "html" do
		request_photo_stream
	end

	# need to support post due to infinite scrolling bug, see https://github.com/paulirish/infinite-scroll/issues/215
	post "/discover", :provides => "html" do
		request_photo_stream
	end

	get "/map", :provides => "html" do
		@title = "Map - hike.io"
		@hide_main_container = true
		erb :map
	end

	get "/:entry_id", :provides => "html" do
		@entry = Entry[:string_id => params[:entry_id]]
		pass unless @entry
		@title = "#{@entry.name} - hike.io"
		erb :entry
	end


	#
	# Helper functions
	#

	def request_photo_stream
		@title = "Discover - hike.io"
		page = params[:page] ? Integer(params[:page]) : 1		
		@featured_entry = Entry.first if page == 1

		# using Sequel's paginate method, not will_paginate's, see https://github.com/mislav/will_paginate/issues/227
		@entries = Entry.where(:id => @featured_entry.id).invert.paginate(page, 4)
		erb :photo_stream
	end

	 # start the server if ruby file executed directly
	run! if app_file == $0
end