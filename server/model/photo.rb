class Photo < Sequel::Model
	one_to_one :hike

	def self.each_rendition &block
		yield "large"
		yield "medium"
		yield "small"
		yield "tiny"
		yield "thumb"
		yield "thumb-tiny"
	end

	def self.each_rendition_including_original &block
		yield "original"
		self.each_rendition &block
	end
end