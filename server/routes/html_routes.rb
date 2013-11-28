require "agent_orange"
require "open-uri"
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
		inject_inlined_html
	end

	helpers do
		# Assumes the svg file has already passed through the process_svg script
		def render_svg(path, attrs=nil)
			render_str = File.open("#{root}/#{path}", "rb").read
			attrs_str = attrs.map{|k,v| "#{k}=\"#{v}\""}.join(' ') if attrs
			render_str.sub("<svg", "<svg data-ui-if=\"Modernizr.svg\" #{attrs_str}");
		end
	end

	def wrap_template_with_script str, template_id
		result = "<script type='text/ng-template' id='/partials/#{template_id}.html'>"
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

	def inject_inlined_html
		content_for :add_modal do
			erb :add
		end
	end

	get "/sitemap.xml", :provides => "xml" do
		@hikes = Hike.all
		erb :sitemap, :layout => false
	end

	get "*" do
		pass unless request.url.include? "www.hike.io"
		redirect request.scheme + "://hike.io" + request.fullpath, 301
	end

	# Route for crawlers only, if url already has a cached result return that immediately
	# then fetch the most recent one and cache that for next time.
	get "*" do
		pass unless params[:_escaped_fragment_]

		url = request.path
		url_params = request.env['rack.request.query_hash']
		url_params.delete("_escaped_fragment_")
		if (url_params.length != 0)
			url += "?" + URI.escape(url_params.collect{|k,v| "#{k}=#{v}"}.join("&"))
		end
		static_html = StaticHtml.get_and_update_for_path(url)

		# Should never pass here, but if for some reason we don't have static html, return dynamic and hopefully it will work next time
		pass if not static_html 
		static_html.html
	end

	["/", "/partials/index.html"].each do |path|
		get path, :provides => "html" do
			render_template :index
		end
	end

	["/hikes", "/partials/all.html"].each do |path|
		get path, :provides => "html" do
			if not @is_partial
				preload_resource "/api/v1/hikes?fields=locality,name,string_id", array_as_json(Hike.order(:id).all, [:locality, :name, :string_id])
			end
			render_template :all
		end
	end

	["/discover", "/partials/photo_stream.html"].each do |path|
		get path, :provides => "html" do
			if not @is_partial
				preload_resource "/api/v1/hikes?fields=distance,locality,name,photo_preview,string_id", array_as_json(Hike.order(:id).all, [:distance, :locality, :name, :photo_preview, :string_id])
			end
			render_template :photo_stream
		end
	end

	["/map", "/partials/map.html"].each do |path|
		get path, :provides => "html" do
			render_template :map
		end
	end

	["/search", "/partials/search.html"].each do |path|
		get path, :provides => "html" do
			render_template :search
		end
	end

	["/hikes/:hike_id", "/hikes/:hike_id/edit", "/partials/entry.html"].each do |path|
		get path, :provides => "html" do
			hike_id = params[:hike_id]
			hike = Hike.get_hike_from_id hike_id
			return 404 if path != "/partials/entry.html" and !hike and !Review.has_pending_review_for_hike?(params[:hike_id])

			if not @is_partial
				resource_id = "/api/v1/hikes/" + hike_id
				preload_resource resource_id, hike.as_json if hike
			end
			render_template :entry
		end
	end

	# Temporary, need a better way of setting admin status than in a cookie
	get "/cookie", :provides => "html" do
		params.each do |key, value|
			response.set_cookie(key, {
				:value => value,
				:httponly => true })
		end
		redirect "/"
	end

	get %r{^\/(.*)\/$}, :provides => "html" do
		# Redirect urls with trailing /'s
		redirect params[:captures].first, 301
	end
end