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
end