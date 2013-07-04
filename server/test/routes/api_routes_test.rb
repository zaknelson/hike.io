require "rack/test"
require "test/unit"
require_relative "../test_case"
require_relative "../../model/database"
require_relative "../../routes/api_routes"

class ApiRoutesTest < HikeAppTestCase

	def setup
		clear_cookies
		header "Accept", "application/json"
		header "User-Agent", "rack/test (#{Rack::Test::VERSION})"
	end


	#
	# GET /api/v1/hikes
	#

	def test_get_hikes_ok
		get "/api/v1/hikes"
		assert last_response.ok?
	end

	def test_get_hikes_returns_multiple_hikes
		get "/api/v1/hikes"
		json = JSON.parse(last_response.body)
		assert json.length > 0
	end

	def test_get_hikes_includes_location
		get "/api/v1/hikes"
		json = JSON.parse(last_response.body)
		location = json[0]["location"]
		assert location != nil
		assert location["longitude"] != nil
		assert location["latitude"] != nil
	end

	def test_trailing_slash_doesnt_redirect
		get "/api/v1/hikes/"
		assert last_response.not_found?
	end

	#
	# GET /api/v1/hikes/:id
	#
	def test_get_hike_by_id
		get "/api/v1/hikes/1"
		json = JSON.parse(last_response.body)
		assert_equal 1, json["id"]
	end

	def test_get_hike_by_string_id
		get "/api/v1/hikes/empty"
		json = JSON.parse(last_response.body)
		assert_equal "empty", json["string_id"]
	end


	#
	# POST /api/v1/hikes
	#

	def test_post_hike_without_credentials
		post "/api/v1/hikes", get_post_hike_json.to_json
		assert_equal 403, last_response.status
	end

	def test_post_with_credentials
		data = get_post_hike_json
		set_admin_cookie
		post "/api/v1/hikes", data.to_json
		validate data, "new-name"
	end

	def test_post_with_incomplete_input
		data = get_post_hike_json
		data.delete("name")
		set_admin_cookie
		post "/api/v1/hikes", data.to_json
		assert_equal 400, last_response.status
	end

	def test_post_with_hike_that_already_exists
		data = get_post_hike_json
		data["name"] = "Empty"
		set_admin_cookie
		post "/api/v1/hikes", data.to_json
		assert_equal 409, last_response.status
	end


	#
	# PUT /api/v1/hikes/:id
	#

	def test_put_hike_without_credentials
		data = {"name" => "New name"}
		put "/api/v1/hikes/empty", data.to_json
		assert_equal 403, last_response.status
	end

	def test_put_hike_name
		data = {"name" => "New name"}
		put_and_validate data
	end

	def test_put_hike_description
		data = {"description" => "New description"}
		put_and_validate data
	end

	def test_put_hike_name_and_description
		data = {"name" => "New name", "description" => "New description"}
		put_and_validate data
	end

	def test_put_hike_location
		data = {"location" => {"latitude" => 56, "longitude" => -123.4}}
		put_and_validate data
	end

	#
	# Helpers
	#

	def put_and_validate data
		set_admin_cookie
		put "/api/v1/hikes/empty", data.to_json
		validate data, "empty"
	end

	def set_admin_cookie
		set_cookie "user_id=#{Digest::SHA1.hexdigest(User.first.id)}"
	end

	def validate data, hike_string_id
		json = JSON.parse(last_response.body)
		assert_equal hike_string_id, json["string_id"]
		validate_hashes data, json
		
		get "/api/v1/hikes/" + hike_string_id
		json = JSON.parse(last_response.body)
		assert_equal hike_string_id, json["string_id"]
		validate_hashes data, json
	end

	def validate_hashes expected_hash, actual_hash
		expected_hash.each do |key, value|
			if value.class == Hash
				validate_hashes value, actual_hash[key]
			else
				assert_equal value, actual_hash[key]
			end
		end
	end

	def get_post_hike_json
		{
			"name" => "New Name",
			"locality" => "New Locality",
			"distance" => 123,
			"elevation_max" => 1234,
			"location" => {
				"latitude" => 12,
				"longitude" => 12
			}
		}
	end
end