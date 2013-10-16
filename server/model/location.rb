class Location < Sequel::Model
	one_to_many :hikes
end