#! /usr/bin/ruby

require "rubygems"

require "compass"
require "json"
require "sass"
require "sinatra"
require "sinatra/base" 
require "sinatra/assetpack"
require "sinatra/content_for"
require "sinatra/partial"
require "will_paginate"
require "will_paginate/sequel"

require_relative "controller/search"
require_relative "model/database"
require_relative "view/localize"

configure :production do
	require "newrelic_rpm"
end

configure :development do
	require_relative "model/seeds"
end

class HikeApp < Sinatra::Base

	set :root, "#{File.dirname(__FILE__)}/../client"

	# erb setup
	set :views, "#{HikeApp.root}/html"

	# will_paginate setup
	register WillPaginate::Sinatra

	# sinatra-partial setup
	register Sinatra::Partial
	set :partial_template_engine, :erb

	# Sass setup 
	set :sass, Compass.sass_engine_options
	set :sass, { :load_paths => sass[:load_paths] + [ "#{HikeApp.root}/css" ] }
	set :scss, sass

	# content_for setup
	helpers Sinatra::ContentFor

	# AssetPack setup
	register Sinatra::AssetPack

	# Compass setup
	Compass.configuration do |config|
		config.project_path = File.dirname(__FILE__)
		config.sass_dir = "#{HikeApp.root}/css" 
	end

	# logging setup
	configure :production, :development do
    	enable :logging
	end

	assets {
		prebuild true

		serve '/js',     from: 'js'
		serve '/css',    from: 'css'
		serve '/images', from: 'images'

		js :app, "/js/app.js", [
			"/js/namespace.js",
			"/js/lib/*.js",
			"/js/utils/*.js",
			"/js/layout.js",
			"/js/*.js"	
		]

		css :app, "/css/app.css", [
			"/css/reset.css",
			"/css/*.css",
			"/css/lib/*.css"
		]

		js_compression :jsmin
   		css_compression :sass
	}

	helpers do
		def root
			"#{File.dirname(__FILE__)}/../client"
		end

		# Assumes the svg file has already passed through the process_svg script
		def render_svg(path, attributes=nil)
			render_str = ""
			if supports_svg?
				render_str = File.open("#{root}/#{path}", "rb").read
			else
				# Remove the extension, and use the backup png
				arr = path.split(".")
				arr.pop
				path = arr.join(".") + ".png"
				render_str = img path;
			end
			# Add any attributes provided
			if attributes
				attr_str = ""
				attributes.each do |key, value|
					attr_str += "#{key}=\"#{value}\" "
				end
				render_str.insert(4, " #{attr_str}");
			end
			render_str
		end

		def supports_svg?
			# Naughty, naughty, sniffing the user agent. I'm not happy with any of the polyfills, 
			# and really would like to use svgs for icons, so it must be done.
			ua = request.user_agent
			not (not ua or
				 ua.include? "Android 2" or 
				 ua.include? "MSIE 6" 	 or 
				 ua.include? "MSIE 7" 	 or 
				 ua.include? "MSIE 8")
		end
	end

	before do
		if settings.environment == :development
			@hike_img_dir = "/hike-images"
			@landing_page_img_dir = "/landing-page-images"
		else
			@hike_img_dir = "http://assets.hike.io/hike-images"
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
			search_executor.logger = logger
			search_executor.query = @query
			@search_results = search_executor.execute

			if search_executor.has_best_result
				redirect "/#{@search_results[0].hike.string_id}"
			end

			@title = "Search - hike.io"
			erb :search
		else
			@hide_search_header = true
			@title = "hike.io - Find beautiful hikes"
			erb :index
		end
	end

	get "/discover", :provides => "html" do
		@title = "Discover - hike.io"
		page = params[:page] ? Integer(params[:page]) : 1		
		@featured_hike = Hike.first if page == 1

		# using Sequel's paginate method, not will_paginate's, see https://github.com/mislav/will_paginate/issues/227
		@hikes = Hike.where(:id => Hike.first.id).invert.paginate(page, 4)
		erb :photo_stream
	end

	get "/map", :provides => "html" do
		@title = "Map - hike.io"
		erb :map
	end

	get "/api/v1/hikes", :provides => "json" do
		Hike.all.to_json
	end

	get "/api/v1/hikes/:hike_id", :provides => "json" do
		hike = get_hike_from_id params[:hike_id]
		hike.to_json if hike
	end

	put "/api/v1/hikes/:hike_id", :provides => "json" do
		hike = get_hike_from_id params[:hike_id]
		if hike
			hike.from_json request.body.string, :fields => ["name", "description", "location"]
			hike.save_changes
			hike.to_json
		end
	end

	get "/:hike_id", :provides => "html" do
		@hike = Hike[:string_id => params[:hike_id]]
		pass unless @hike
		@title = "#{@hike.name} - hike.io"
		erb :hike
	end

	get "/:hike_id/edit", :provides => "html" do
		@hike = Hike[:string_id => params[:hike_id]]
		pass unless @hike
		@title = "Editing #{@hike.name} - hike.io"
		@editing = true
		erb :hike
	end

	def get_hike_from_id hike_id
		hike = Hike[:string_id => hike_id]
		if not hike and KeywordUtils.new.is_word_integer? hike_id
			hike = Hike[:id => Integer(hike_id)]
		end
		hike
	end

	 # start the server if ruby file executed directly
	run! if app_file == $0
end