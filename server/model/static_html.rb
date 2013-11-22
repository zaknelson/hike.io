class StaticHtml < Sequel::Model

	def self.get_static_html_for_path url
		if Sinatra::Application.environment() != :test
			`phantomjs --load-images=false --disk-cache=true server/static-seo-server.js #{url}`
		end
	end

	def self.get_and_update_for_path path
		url = HikeApp.base_url + path
		static_html = StaticHtml.find(:url => path)
		Thread.new do
			html = StaticHtml.get_static_html_for_path(url)
			if not static_html
				static_html = StaticHtml.new(
					:url => path,
					:html => html,
					:fetch_time => Time.now)
				static_html.save
			else
				static_html.html = html
				static_html.fetch_time = Time.now
				static_html.save
			end
		end
		static_html
	end
end