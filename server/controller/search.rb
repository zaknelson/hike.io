require_relative "executor"
require_relative "../model/search_result"
require_relative "../utils/keyword_utils"

class SearchExecutor < Executor
	attr_accessor :query
	attr_accessor :search_results
	attr_accessor :word_weight

	WORD_MATCH_THRESHOLD = 0.35
	BEST_WORD_THRESHOLD = 0.4

	def validate
		# Do nothing, anyone can perform run this executor
	end

	def run
		@search_results = []
		result_set = {}
		words = KeywordUtils.new.sanitize_to_keywords @query
		@word_weight = 1.0 / words.length
		words.each do |word|
			keywords = Keyword.fetch("
				SELECT *, similarity(?, keyword) AS similarity 
				FROM keywords 
				WHERE similarity(?, keyword) >= ?", word, word, WORD_MATCH_THRESHOLD).all
			keywords.each do |keyword|
				keyword.entries.each do |entry|

					if result_set[entry.id]
						search_result = result_set[entry.id]
					else
						search_result = SearchResult.new
						search_result.entry = entry
						search_result.relevance = 0
						@search_results.push search_result
					end

					search_result.relevance += word_weight * keyword[:similarity]
					result_set[entry.id] = search_result
				end
			end
		end
		sort_search_results

		@logger.info "Search results for '#{@query}'"
		@search_results.each do |search_result|
			@logger.info "  #{search_result.entry.string_id} : #{search_result.relevance}"
		end
	end

	def output
		if 	@search_results.length > 1 and
			@search_results[0].relevance >= @search_results[1].relevance + BEST_WORD_THRESHOLD * @word_weight
			@search_results[0..0]
		else
			@search_results
		end
	end

	def sort_search_results
		@search_results.sort! do |a, b| 
			b.relevance - a.relevance
		end
	end
end