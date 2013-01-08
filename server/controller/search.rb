require "logger"

require_relative "executor"
require_relative "../model/database"
require_relative "../model/search_result"
require_relative "../utils/keyword_utils"

class SearchExecutor < Executor

	# Input
	attr_accessor :query
	attr_accessor :logger

	# Output
	attr_accessor :search_results

	KEYWORD_MATCH_THRESHOLD = 0.30
	BEST_KEYWORD_THRESHOLD = 0.4

	def validate
		# Do nothing, anyone can perform run this executor
	end

	def run
		@search_results = []
		@hike_search_result_hash = {}
		keywords = KeywordUtils.new.sanitize_to_keywords @query
		@word_weight = 1.0 / keywords.length
		keywords.each do |keyword|
			search_for_keyword keyword
		end
		sort_search_results

		@logger.info "Search results for '#{@query}'"
		@search_results.each do |search_result|
			@logger.info "  #{search_result.hike.string_id} : #{search_result.relevance}"
		end
	end

	def output
		@search_results
	end

	def has_best_result
	 	@search_results.length == 1 or 
			(@search_results.length > 1 and 
				@search_results[0].relevance >= @search_results[1].relevance + BEST_KEYWORD_THRESHOLD * @word_weight)
	end

	def search_for_keyword query_keyword
		db_keywords = Keyword.fetch("
			SELECT *, similarity(?, keyword) AS similarity 
			FROM keywords 
			WHERE similarity(?, keyword) >= ?", query_keyword, query_keyword, KEYWORD_MATCH_THRESHOLD).all
		db_keywords.each do |db_keyword|
			db_keyword.hikes.each do |hike|

				if @hike_search_result_hash[hike.id]
					search_result = @hike_search_result_hash[hike.id]
				else
					search_result = SearchResult.new
					search_result.hike = hike
					search_result.relevance = 0
					@search_results.push search_result
				end

				search_result.relevance += @word_weight * db_keyword[:similarity]
				@hike_search_result_hash[hike.id] = search_result
			end
		end
	end

	def sort_search_results
		@search_results.sort! do |a, b| 
			b.relevance - a.relevance
		end
	end
end