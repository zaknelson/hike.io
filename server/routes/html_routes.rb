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

	def render_template template_id
		cache_key = request.fullpath
		cached_template = $cache.get(cache_key)
		return cached_template if cached_template

		html = partial(template_id)
		if !@is_partial
			html = erb("<script type='text/ng-template' id='/partials/#{template_id}.html'>#{html}</script>")
		end
		$cache.set(cache_key, html)
		html
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
		content_for :photo_details_modal do
			erb :photo_details
		end
	end

	def sitemap_image_element photo, hike
		caption = photo.alt ? "<image:caption>#{photo.alt}</image:caption>" : ""
		return "<image:image> \
					<image:loc>http://assets.hike.io/hike-images/#{photo.string_id}-large.jpg</image:loc> \
					#{caption} \
					<image:geo_location>#{hike.locality}</image:geo_location> \
				</image:image>"
	end

	get "/sitemap.xml", :provides => "xml" do
		@hikes = Hike.all
		erb :sitemap, :layout => false
	end

	get "*" do
		pass unless request.url.include? "www.hike.io"
		redirect request.scheme + "://hike.io" + request.fullpath, 301
	end

	get "/robots.txt", :provides => "text/plain"  do
		if request.url.include?("static.hike.io")
			"User-agent: *\nDisallow: /"
		else
			"User-agent: *\nDisallow: /partials/\nDisallow: /search \nDisallow: /hikes/*/edit"
		end
	end 

	# Route for crawlers only, if url already has a cached result return that immediately
	# then fetch the most recent one and cache that for next time.
	get "*" do
		pass unless params[:_escaped_fragment_] || request.user_agent.include?("facebookexternalhit") || request.url.include?("static.hike.io")
		url = request.path
		return 403 if url.start_with?("/hikes/") && url.end_with?("/edit")
		url_params = request.env['rack.request.query_hash']
		url_params.delete("_escaped_fragment_")
		if (url_params.length != 0)
			url += "?" + URI.escape(url_params.collect{|k,v| "#{k}=#{v}"}.join("&"))
		end
		static_html = StaticHtml.get_and_update_for_path(url)

		# Should never pass here, but if for some reason we don't have static html, return dynamic and hopefully it will work next time
		pass if not static_html 

		html = static_html.html
		if request.url.include?("static.hike.io")
			html.sub!("<!-- NOSCRIPT_PLACEHOLDER -->", '<noscript><div class="noscript-header">hike.io works better with <a href="http://www.activatejavascript.org/">JavaScript enabled</a>.</div></noscript>')
		end
		html
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
				preload_resource "/api/v1/hikes?fields=distance,locality,name,photo_facts,photo_preview,string_id", array_as_json(Hike.order(:id).all, [:distance, :locality, :name, :photo_facts, :photo_preview, :string_id])
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
			hike = Hike[:string_id => hike_id]
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

	# Workaround for bug in sinatra-assetpack, https://github.com/rstacruz/sinatra-assetpack/pull/147
	["/images/favicon.ico", "/favicon.ico",].each do |path|
		get path do
			send_file "#{root}/images/favicon.ico", :type => "image/x-icon"
		end
	end

	get %r{^\/(.*)\/$}, :provides => "html" do
		# Redirect urls with trailing /'s
		redirect params[:captures].first, 301
	end
end