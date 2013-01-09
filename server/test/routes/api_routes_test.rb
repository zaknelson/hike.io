require "rack/test"
require "test/unit"
require_relative "../test_case"
require_relative "../../routes/api_routes"

class ApiRoutesTest < HikeAppTestCase

	def setup
		header "Accept", "application/json" 
	end

	def test_get_hikes_ok
		get "/api/v1/hikes"
		assert last_response.ok?
	end

	def test_get_hikes_returns_multiple_hikes
		get "/api/v1/hikes"
		json = JSON.parse(last_response.body)
		assert json.length > 0
	end

	def test_get_hike_by_id
		get "/api/v1/hikes/1"
		json = JSON.parse(last_response.body)
		assert_equal json["id"], 1
	end

	def test_get_hike_by_string_id
		get "/api/v1/hikes/scotchman-peak"
		json = JSON.parse(last_response.body)
		assert_equal json["string_id"], "scotchman-peak"
	end

	def test_put_hike_name
		data = {:name => "New name"}
		put_data data
	end

	def test_put_hike_description
		data = {:description => "New description"}
		put_data data
	end

	def test_put_hike_name_and_description
		data = {:name => "New name", :description => "New description"}
		put_data data
	end

	def test_trailing_slash_doesnt_redirect
		get "/api/v1/hikes/"
		assert last_response.not_found?
	end

	def put_data data
		put "/api/v1/hikes/scotchman-peak", data.to_json

		json = JSON.parse(last_response.body)
		assert_equal json["string_id"], "scotchman-peak"
		data.each { |key| assert_equal json[key], data[key] } 
		
		get "/api/v1/hikes/scotchman-peak"
		json = JSON.parse(last_response.body)
		assert_equal json["string_id"], "scotchman-peak"
		data.each { |key| assert_equal json[key], data[key] } 
	end
end