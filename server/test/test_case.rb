require "rack/test"
require "test/unit"

ENV["RACK_ENV"] = "test"

class HikeAppTestCase < Test::Unit::TestCase
	include Rack::Test::Methods

	def app
		HikeApp
	end

	def run(*args, &block)
		result = nil
		Sequel::Model.db.transaction(:rollback => :always){ result = super }
		result
	end

	def set_admin_cookie
		set_cookie "user_id=#{Digest::SHA1.hexdigest(User.first.id)}"
	end

	def get_put_json
		get "/api/v1/hikes/empty"
		json = JSON.parse(last_response.body)
		json["name"] = "New Name"
		json["locality"] = "New Locality"
		json["distance"] = 123
		json["elevation_gain"] = 1234
		json["elevation_max"] = 1234
		json["location"] = { "latitude" => 12, "longitude" => 12 }
		json
	end

	def get_post_json
		{
			"name" => "New Name",
			"locality" => "New Locality",
			"distance" => 123,
			"elevation_gain" => 1234,
			"elevation_max" => 1234,
			"location" => {
				"latitude" => 12,
				"longitude" => 12
			}
		}
	end
end