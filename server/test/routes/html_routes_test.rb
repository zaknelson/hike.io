require "rack/test"
require "test/unit"
require_relative "../test_case"
require_relative "../../model/database"
require_relative "../../routes/html_routes"

class HtmlRoutesTest < HikeAppTestCase

	def setup
		clear_cookies
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

	def test_photo_stream_page1_ok
		get "/discover?page=1"
		assert last_response.ok?
	end

	def test_photo_stream_page2_ok
		get "/discover?page=2"
		assert last_response.ok?
	end

	def test_hike_ok
		get "/hikes/scotchman-peak"
		assert last_response.ok?
	end

	def test_hike_edit_ok
		set_cookie "user_id=#{User.first.id}"
		get "/hikes/scotchman-peak/edit"
		assert last_response.ok?
	end

	def test_hike_edit_requires_credentials
		get "/hikes/scotchman-peak/edit"
		assert_equal 403, last_response.status
	end

	def test_missing_hike_not_found
		get "/hikes/some-missing-hike"
		assert last_response.not_found?
	end

	def test_good_query_redirects_to_hike
		get "/?q=scotchman%20peak"
		assert last_response.redirect?
		assert_equal "http://example.org/scotchman-peak", last_response.location
	end

	def test_query_with_multiple_possible_results
		get "/?q=peak"
		assert last_response.ok?
		assert last_response.body.include? "Scotchman Peak"
		assert last_response.body.include? "Pike's Peak"
	end

	def test_bad_query
		get "/?q=somemissinghike"
		assert last_response.ok?
		assert last_response.body.include? "somemissinghike"
	end

	def test_trailing_slash_redirects
		get "/scotchman-peak/"
		assert last_response.redirect?
		assert_equal "http://example.org/scotchman-peak", last_response.location
	end
end