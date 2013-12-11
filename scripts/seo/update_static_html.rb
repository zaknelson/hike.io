require "open-uri"

# Useful script for updating all of the static html on the site (in normal circumstances this is not 
# necessary because the static html is updated automatically)
def main
	contents = URI.parse("http://hike.io/sitemap.xml").read
	contents.scan(/<loc>(.*)<\/loc>/).each do |match|
		url = match[0]
		puts "updating static html for #{url}"
		contents = URI.parse(url + "?_escaped_fragment_=").read
		sleep 5
	end
end

main()