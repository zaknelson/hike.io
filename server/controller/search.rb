require_relative "executor"

class SearchExecutor < Executor
	attr_accessor :query
	attr_accessor :entries

	def validate
		# Do nothing, anyone can perform run this executor
	end

	def run
		@query.split(/\W+/).each do |word|
			keywords = Keyword.where("similarity(?, keyword) >= .5", @query).all
			@entries = []
			keywords.each do |keyword|
				@entries += keyword.entries
			end
		end
	end

	def output
		@entries
	end
end