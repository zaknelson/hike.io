class Keyword < Sequel::Model
	many_to_many :hikes
end