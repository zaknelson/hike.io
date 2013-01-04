require "rack/test"
require "test/unit"
require_relative "../../server"

class RoutesTest < Test::Unit::TestCase

	include Rack::Test::Methods

	def app
		HikeApp
	end

	def setup
		header "Accept", "text/html" 
	end

	def test_home_page_ok
		get "/"
		assert last_response.ok?
	end

	def test_map_page_ok
		get "/map"
		assert last_response.ok?
	end

	def test_photo_stream_page_ok
		get "/discover"
		assert last_response.ok?
	end

	def test_missing_entry_not_found
		get "/some-missing-entry"
		assert last_response.not_found?
	end

	def test_good_query_redirects_to_entry
		get "/?q=scotchman%20peak"
		assert last_response.redirect?
		assert_equal last_response.location, "http://example.org/scotchman-peak"
	end

	def test_query_with_multiple_possible_results
		get "/?q=peak"
		assert last_response.ok?
		assert last_response.body.include? "Scotchman Peak"
		assert last_response.body.include? "Pike's Peak"
	end

	def test_bad_query
		get "/?q=somemissingentry"
		assert last_response.ok?
		assert last_response.body.include? "somemissingentry"
	end
end