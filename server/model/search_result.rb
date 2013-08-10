class SearchResult
	attr_accessor :hike
	attr_accessor :relevance

	def as_json fields
		"{\"hike\":#{hike.as_json fields},\"relevance\":#{relevance}}"
	end
end