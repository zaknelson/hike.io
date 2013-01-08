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
		newName = "New name"
		data = {:name => newName}
		put "/api/v1/hikes/scotchman-peak", data.to_json
		json = JSON.parse(last_response.body)
		assert_equal json["string_id"], "scotchman-peak"
		assert_equal json["name"], newName
	end
end