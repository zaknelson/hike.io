require "nokogiri"
require "open-uri"

def request url
	sleep 5
	Nokogiri::HTML(open(url))
end