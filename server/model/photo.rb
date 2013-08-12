class Photo < Sequel::Model
	one_to_one :hike

	def self.each_rendition
		yield "large"
		yield "medium"
		yield "small"
		yield "tiny"
		yield "thumb"
		yield "thumb-tiny"
	end
end