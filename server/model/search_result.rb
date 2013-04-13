class SearchResult
	attr_accessor :hike
	attr_accessor :relevance

	def to_json *a
		{
			:hike => hike,
			:relevance => relevance
		}.to_json(*a)
	end
end