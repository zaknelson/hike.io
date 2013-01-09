require "rack/test"
require "test/unit"

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