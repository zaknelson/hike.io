require "rack/test"
require "test/unit"
require_relative "../test_case"
require_relative "../../model/database"
require_relative "../../routes/admin_routes"
require_relative "../../routes/api_routes"

class AdminRoutesTest < HikeAppTestCase

	def setup
		clear_cookies
		header "Accept", "application/json"
		header "User-Agent", "rack/test (#{Rack::Test::VERSION})"
	end


	#
	# GET /admin/v1/reviews/:review_id
	#

	def test_get_missing_review
		set_admin_cookie
		get "/admin/v1/reviews/missing-id"
		assert_equal 404, last_response.status
	end

	def test_get_review
		put "/api/v1/hikes/empty", get_basic_hike_json.to_json
		set_admin_cookie
		get "/admin/v1/reviews/" + Review.first.string_id
		json = JSON.parse(last_response.body)
		assert_equal 200, last_response.status
		assert_equal Review::STATUS_UNREVIEWED, json["status"]
		assert_equal "put", json["api_verb"]
	end


	#
	# GET /admin/v1/reviews/:review_id/accept
	#

	def test_accept_review
		json_obj = get_basic_hike_json
		put "/api/v1/hikes/empty", json_obj.to_json
		set_admin_cookie
		get "/admin/v1/reviews/" + Review.first.string_id + "/accept"
		assert_equal 302, last_response.status

		get "/admin/v1/reviews/" + Review.first.string_id
		json = JSON.parse(last_response.body)
		assert_equal 200, last_response.status
		assert_equal Review::STATUS_ACCEPTED, json["status"]

		get "/api/v1/hikes/empty"
		assert_equal json_obj["name"], JSON.parse(last_response.body)["name"]
	end

	def test_accept_without_credentials
		put "/api/v1/hikes/empty", get_basic_hike_json.to_json
		get "/admin/v1/reviews/" + Review.first.string_id + "/accept"
		assert_equal 403, last_response.status
	end

	def test_accept_already_accepted
		put "/api/v1/hikes/empty", get_basic_hike_json.to_json
		set_admin_cookie
		get "/admin/v1/reviews/" + Review.first.string_id + "/accept"
		get "/admin/v1/reviews/" + Review.first.string_id + "/accept"
		assert_equal 409, last_response.status
	end

	def test_accept_already_updated
		put "/api/v1/hikes/empty", get_basic_hike_json.to_json
		set_admin_cookie
		put "/api/v1/hikes/empty", get_basic_hike_json.to_json
		get "/admin/v1/reviews/" + Review.first.string_id + "/accept"
		assert_equal 409, last_response.status
	end

	def test_accept_delete
		delete "/api/v1/hikes/scotchman-peak"
		set_admin_cookie
		get "/admin/v1/reviews/" + Review.first.string_id + "/accept"
		assert_equal 302, last_response.status

		get "/api/v1/hikes/scotchman-peak"
		assert_equal 404, last_response.status
	end

	def test_accept_post_and_put
		# Setup reviews
		json_obj = get_basic_hike_json
		post "/api/v1/hikes", get_basic_hike_json.to_json
		description = "<p>updated description</p>"
		json_obj["description"] = description
		put "/api/v1/hikes/new-name", json_obj.to_json

		# Accept reviews
		set_admin_cookie
		get "/admin/v1/reviews/" + Review[:api_verb => "post"].string_id + "/accept"
		assert_equal 302, last_response.status
		get "/api/v1/hikes/new-name"
		get "/admin/v1/reviews/" + Review[:api_verb => "put"].string_id + "/accept"
		assert_equal 302, last_response.status

		# Verify
		get "/api/v1/hikes/new-name"
		assert_equal description, JSON.parse(last_response.body)["description"]
	end


	#
	# GET /admin/v1/reviews/:review_id/reject
	#

	def test_reject_review
		put "/api/v1/hikes/empty", get_basic_hike_json.to_json
		set_admin_cookie
		get "/admin/v1/reviews/" + Review.first.string_id + "/reject"
		assert_equal 302, last_response.status

		get "/admin/v1/reviews/" + Review.first.string_id
		json = JSON.parse(last_response.body)
		assert_equal 200, last_response.status
		assert_equal Review::STATUS_REJECTED, json["status"]
	end

	def test_reject_without_credentials
		put "/api/v1/hikes/empty", get_basic_hike_json.to_json
		get "/admin/v1/reviews/" + Review.first.string_id + "/reject"
		assert_equal 403, last_response.status
	end

	def test_reject_already_accepted
		put "/api/v1/hikes/empty", get_basic_hike_json.to_json
		set_admin_cookie
		get "/admin/v1/reviews/" + Review.first.string_id + "/accept"
		get "/admin/v1/reviews/" + Review.first.string_id + "/reject"
		assert_equal 409, last_response.status
	end
end