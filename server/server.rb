#! /usr/bin/ruby

require "rubygems"

require "compass"
require "json"
require "sass"
require "sinatra"
require "sinatra/base" 
require "sinatra/assetpack"
require "sinatra/content_for"
require "sinatra/cookies"
require "sinatra/partial"
require "will_paginate"
require "will_paginate/sequel"

require_relative "controller/search"
require_relative "model/database"

configure :production do
	require "newrelic_rpm"
end

configure :development, :test do
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

	# cookies
	helpers Sinatra::Cookies

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

		serve "/js",     from: "js"
		serve "/css",    from: "css"
		serve "/images", from: "images"

		js :app, "/js/app.js", [
			"/js/main.js",
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

		def is_admin?
			Sinatra::Application.environment() == :development or cookies["user_id"] == User.first.id
		end
	end
end

require_relative "routes/api_routes"
require_relative "routes/html_routes"