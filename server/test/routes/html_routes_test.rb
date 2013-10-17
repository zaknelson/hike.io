require "rack/test"
require "test/unit"
require_relative "../test_case"
require_relative "../../model/database"
require_relative "../../routes/html_routes"

class HtmlRoutesTest < HikeAppTestCase

	def setup
		clear_cookies
		header "Accept", "text/html"
		header "User-Agent", "rack/test (#{Rack::Test::VERSION})"
	end

	def test_get_pages_return_200
		get_and_assert_status "/", 200
		get_and_assert_status "/map", 200
		get_and_assert_status "/discover", 200
		get_and_assert_status "/discover?page=1", 200
		get_and_assert_status "/discover?page=2", 200
		get_and_assert_status "/hikes/scotchman-peak", 200
		get_and_assert_status "/hikes/scotchman-peak/edit", 200
		get_and_assert_status "/search", 200
		get_and_assert_status "/search?q=peak", 200
	end

	def test_missing_pages_return_404
		get_and_assert_status "/missing-page", 404
		get_and_assert_status "/hikes/some-missing-hike", 404
	end

	def test_trailing_slash_redirects
		get "/scotchman-peak/"
		assert last_response.redirect?
		assert_equal "http://example.org/scotchman-peak", last_response.location
	end

	def test_get_sitemap
		header "Accept", "text/xml"
		get_and_assert_status "/sitemap.xml", 200
	end

	def get_and_assert_status path, status
		get path
		assert_equal status, last_response.status
	end
end