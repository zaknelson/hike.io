#! /usr/bin/ruby

require "rubygems"

require "agent_orange"
require "compass"
require "json"
require "sass"
require "sinatra"
require "sinatra/base" 
require "sinatra/assetpack"
require "sinatra/config_file"
require "sinatra/content_for"
require "sinatra/cookies"
require "sinatra/partial"
require "uglifier"
require "will_paginate"
require "will_paginate/sequel"

require_relative "controller/search"
require_relative "model/database"
require_relative "model/hike"

configure :production do
	require "newrelic_rpm"
end

#set :environment, :production

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

		expires 60*60*24*365, :public # Assets expire in a year

		serve "/js",     from: "js"
		serve "/css",    from: "css"
		serve "/images", from: "images"

		js :app, "/js/app.js", [
			"/js/main.js",
			"/js/*/*.js"
		]

		css :app, "/css/app.css", [
			"/css/reset.css",
			"/css/*.css",
			"/css/lib/*.css"
		]

		js_compression :uglify, { :output => { :comments => :none } }
   		css_compression :sass
	}

	helpers do
		def root
			"#{File.dirname(__FILE__)}/../client"
		end

		def is_admin?
			Sinatra::Application.environment() == :development or cookies["user_id"] == Digest::SHA1.hexdigest(User.first.id)
		end

		def array_as_json array, fields=nil
			json = "["
			array.each_with_index do |element, i|
				json += element.as_json fields
				json += "," if i != array.length - 1
			end
			json += "]"
		end
	end

	before do
		@user_agent = AgentOrange::UserAgent.new(request.user_agent)
	end
end

require_relative "routes/api_routes"
require_relative "routes/html_routes"