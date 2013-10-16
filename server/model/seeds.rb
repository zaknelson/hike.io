require_relative "database"

migration "seed admin user" do
	User.create(:id => UUIDTools::UUID.random_create.to_s)
end