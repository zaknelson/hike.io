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
	end

	helpers do
		# Assumes the svg file has already passed through the process_svg script
		def render_svg(path)
			render_str = File.open("#{root}/#{path}", "rb").read
			img_fallback_path = path.sub(".svg", ".png")
			render_str.sub("<svg", "<svg data-hikeio-fallback-img-src=\"#{img_fallback_path}\"");
		end
	end

	def render_template template
		is_partial = request.path_info.start_with? "/templates/"
		is_partial ? partial(template) : erb(template)
	end

	get %r{^(/|/templates/index.html)$}, :provides => "html" do
		@template_id = "templates/index.html"
		render_template :index
	end

	get %r{^(/discover|/templates/photo_stream.html)$}, :provides => "html" do
		@template_id = "templates/photo_stream.html"
		return erb :blank if Hike.count == 0
		page = params[:page] ? Integer(params[:page]) : 1   
		@featured_hike = Hike.first if page == 1

		# using Sequel's paginate method, not will_paginate's, see https://github.com/mislav/will_paginate/issues/227
		@hikes = Hike.where(:id => Hike.first.id).invert.paginate(page, 4) 
		render_template :photo_stream
	end

	get %r{^(/map|/templates/map.html)$}, :provides => "html" do
		@template_id = "templates/map.html"
		render_template :map
	end

	get %r{\/(.*)\/}, :provides => "html" do
		# Redirect urls with trailing /'s
		redirect params[:captures].first
	end
end