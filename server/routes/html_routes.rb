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
		@is_partial = params[:partial] == "true"
	end

	helpers do
		# Assumes the svg file has already passed through the process_svg script
		def render_svg(path)
			render_str = File.open("#{root}/#{path}", "rb").read
			img_fallback_path = path.sub(".svg", ".png")
			render_str.sub("<svg", "<svg data-hikeio-fallback-img-src=\"#{img_fallback_path}\"");
		end
	end

	def wrap_template_with_script str, template_id
		result = "<script type=\"text/ng-template\" id=\"#{template_id}?partial=true\">"
		result += str
		result += "</script>"
	end

	def render_template template_id, script_template_id=nil
		script_template_id = script_template_id || template_id
		rendered_template = partial template_id
		if @is_partial
			rendered_template
		else
			wrapped_partial = wrap_template_with_script rendered_template, script_template_id
			erb wrapped_partial
		end
	end

	get "/", :provides => "html" do
		render_template :index, "/"
	end

	get "/discover", :provides => "html" do
		return erb :blank if Hike.count == 0
		page = params[:page] ? Integer(params[:page]) : 1   
		@featured_hike = Hike.first if page == 1

		# using Sequel's paginate method, not will_paginate's, see https://github.com/mislav/will_paginate/issues/227
		@hikes = Hike.where(:id => Hike.first.id).invert.paginate(page, 4) 
		render_template :photo_stream
	end

	get "/map", :provides => "html" do
		render_template :map
	end

	get %r{\/(.*)\/}, :provides => "html" do
		# Redirect urls with trailing /'s
		redirect params[:captures].first
	end
end