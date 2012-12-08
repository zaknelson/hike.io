require_relative "executor"

class SearchExecutor < Executor
	attr_accessor :query
	attr_accessor :best_entry

	def validate
		# Do nothing, anyone can perform run this executor
	end

	def run
		@query.split(/\W+/).each do |word|
			keywords = Keyword.where("similarity(?, keyword) >= .5", @query).all
			potential_entries = []
			keywords.each do |keyword|
				potential_entries += keyword.entries
			end

			if potential_entries.length > 0
				@best_entry = potential_entries[0];
			end
		end
	end

	def output
		@best_entry
	end
end