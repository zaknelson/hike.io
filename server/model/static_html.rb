class StaticHtml < Sequel::Model

	def self.get_static_html_for_url url
		`phantomjs --disk-cache=true server/static-seo-server.js #{url}`
	end

	def self.get_and_update_for_url url
		static_html = StaticHtml.find(:url => url)
		if not static_html
			puts "fetching #{url} first"
			static_html = StaticHtml.new(
				:url => url,
				:html => get_static_html_for_url(url),
				:fetch_time => Time.now
				)
			static_html.save
		else
			if Time.now - static_html.fetch_time > 86400 # one day
				Thread.new do
					static_html.html = get_static_html_for_url(url)
					static_html.fetch_time = Time.now
					static_html.save
				end
			end
		end
		static_html
	end
end