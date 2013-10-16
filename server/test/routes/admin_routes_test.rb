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

	def test_get_missing_review
		set_admin_cookie
		get "/admin/v1/reviews/missing-id"
		assert_equal 404, last_response.status
	end
end