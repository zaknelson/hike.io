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

		@is_partial = request.path_info.start_with? "/partials/"
		@img_dir = "/images"
	end

	helpers do
		# Assumes the svg file has already passed through the process_svg script
		def render_svg(path)
			render_str = File.open("#{root}/#{path}", "rb").read
			render_str.sub("<svg", '<svg data-ui-if="Modernizr.svg"');
		end
	end

	def wrap_template_with_script str, template_id
		result = "<script type=\"text/ng-template\" id=\"/partials/#{template_id}.html\">"
		result += str
		result += "</script>"
	end

	def render_template template_id
		rendered_template = partial template_id
		if @is_partial
			rendered_template
		else
			wrapped_partial = wrap_template_with_script rendered_template, template_id
			erb wrapped_partial
		end
	end

	def preload_resource resource_id, resource
		content_for :preload_resource do
			"<div data-preload-resource='#{resource_id}'>#{resource}</div>"
		end
	end

	["/", "/partials/index.html"].each do |path|
		get path do
			render_template :index
		end
	end

	["/discover", "/partials/photo_stream.html"].each do |path|
		get path do
			render_template :photo_stream
		end
	end

	["/map", "/partials/map.html"].each do |path|
		get path do
			render_template :map
		end
	end

	["/search", "/partials/search.html"].each do |path|
		get path do
			render_template :search
		end
	end

	["/hikes/:hike_id", "/hikes/:hike_id/edit", "/partials/entry.html"].each do |path|
		get path do
			hike_id = params[:hike_id]
			hike = RoutesUtils.new.get_hike_from_id hike_id
			return 403 if path == "/hikes/:hike_id/edit" and !is_admin?
			return 404 if path != "/partials/entry.html" and !hike

			if not @is_partial
				resource_id = "/api/v1/hikes/" + hike_id
				preload_resource resource_id, hike.to_json
			end
			render_template :entry
		end
	end

	get %r{\/(.*)\/}, :provides => "html" do
		# Redirect urls with trailing /'s
		redirect params[:captures].first
	end
end