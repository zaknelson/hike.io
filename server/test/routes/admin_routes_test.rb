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
		put "/api/v1/hikes/empty", get_basic_hike_json.to_json
		set_admin_cookie
		get "/admin/v1/reviews/" + Review.first.string_id + "/accept"
		assert_equal 302, last_response.status

		get "/admin/v1/reviews/" + Review.first.string_id
		json = JSON.parse(last_response.body)
		assert_equal 200, last_response.status
		assert_equal Review::STATUS_ACCEPTED, json["status"]
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