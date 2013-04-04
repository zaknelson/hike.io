require_relative "../server"

class HikeApp < Sinatra::Base

	before do
		if settings.environment == :development
			@hike_img_dir = "/hike-images"
			@hike_map_img_dir = "/hike-map-images"
			@landing_page_img_dir = "/landing-page-images"
		else
			@hike_img_dir = "http://assets.hike.io/hike-images"
			@hike_map_img_dir = "http://assets.hike.io/hike-map-images"
			@landing_page_img_dir = "http://assets.hike.io/landing-page-images"
		end

		@img_dir = "/images"
		@title = "hike.io"
	end

	helpers do
		# Assumes the svg file has already passed through the process_svg script
		def render_svg(path)
			render_str = File.open("#{root}/#{path}", "rb").read
			img_fallback_path = path.sub(".svg", ".png")
			render_str.sub("<svg", "<svg data-hikeio-fallback-img-src=\"#{img_fallback_path}\"");
		end
	end

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

	get "/add", :provides => "html" do
		@title = "Add Hike - hike.io"
		erb :blank
	end

	get "/discover", :provides => "html" do
		@title = "Discover - hike.io"
		
		return erb :blank if Hike.count == 0

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

	get "/:hike_id", :provides => "html" do
		@hike = Hike[:string_id => params[:hike_id]]
		pass unless @hike
		@title = "#{@hike.name} - hike.io"
		erb :hike
	end

	get "/:hike_id/edit", :provides => "html" do
		return 403 if not is_admin?
		@hike = Hike[:string_id => params[:hike_id]]
		pass unless @hike
		@title = "Editing #{@hike.name} - hike.io"
		@editing = true
		erb :hike
	end

	get %r{\/(.*)\/}, :provides => "html" do
		# Redirect urls with trailing /'s
		redirect params[:captures].first
	end
end