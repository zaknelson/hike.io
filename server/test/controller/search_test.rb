require "rack/test"
require "test/unit"
require_relative "../../../server/controller/search"

class SearchExecutorTest < Test::Unit::TestCase

	include Rack::Test::Methods

	SCOTCHMAN_PEAK_ID	= "scotchman-peak"
	PIKES_PEAK_ID		= "pikes-peak"
	LAKE_22_ID			= "lake-22"
	MT_KILIMANJARO		= "mt-kilimanjaro"

	def setup
		@executor = SearchExecutor.new
		@executor.logger = Logger.new("/dev/null")
	end

	def test_exact_match
		@executor.query = "Scotchman Peak"
		validate_best_result @executor.execute, SCOTCHMAN_PEAK_ID, 1.0
	end

	def test_one_minor_misspelling
		@executor.query = "Skotchman Peak"
		validate_best_result @executor.execute, SCOTCHMAN_PEAK_ID
	end

	def test_two_minor_misspelling
		@executor.query = "Skotchmap Peak"
		search_results = @executor.execute

		# Spelling is messed up enough that we expect both results, but 
		# Scotchman should be ranked above Pike's Peak
		assert !@executor.has_best_result
		assert_equal search_results.length, 2
		assert_equal search_results[0].entry.string_id, SCOTCHMAN_PEAK_ID
		assert_equal search_results[1].entry.string_id, PIKES_PEAK_ID
		assert search_results[0].relevance > search_results[1].relevance
	end

	def test_transposed_letters
		@executor.query = "Scotchmna Peak"
		validate_best_result @executor.execute, SCOTCHMAN_PEAK_ID
	end

	def test_swapped_keywords
		@executor.query = "Peak Scotchman"
		validate_best_result @executor.execute, SCOTCHMAN_PEAK_ID, 1.0
	end

	def test_major_misspelling
		@executor.query = "Skochmap"
		search_results = @executor.execute
		assert_equal search_results.length, 0
	end

	def test_multiple_exact_matches
		@executor.query = "Peak"
		search_results = @executor.execute
		assert_equal search_results.length, 2
		assert_equal search_results[0].entry.string_id, SCOTCHMAN_PEAK_ID
		assert_equal search_results[1].entry.string_id, PIKES_PEAK_ID
		assert search_results[0].relevance = search_results[1].relevance
	end

	def test_numeric_query
		@executor.query = "Lake 22"
		validate_best_result @executor.execute, LAKE_22_ID, 1.0
	end

	def test_humanized_numeric_query
		@executor.query = "Lake Twenty-two"
		validate_best_result @executor.execute, LAKE_22_ID, 1.0
	end

	def test_keyword_synonyms
		@executor.query = "Mount Kilimanjaro"
		validate_best_result @executor.execute, MT_KILIMANJARO, 1.0

		@executor.query = "Mt. Kilimanjaro"
		validate_best_result @executor.execute, MT_KILIMANJARO, 1.0

		@executor.query = "Mt Kilimanjaro"
		validate_best_result @executor.execute, MT_KILIMANJARO, 1.0
	end

	def validate_best_result search_results, string_id, relevance = nil
		assert @executor.has_best_result
		assert_equal search_results[0].relevance, relevance if relevance
		assert_equal search_results[0].entry.string_id, string_id
	end

end