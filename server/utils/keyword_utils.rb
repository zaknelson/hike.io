require "humanize"

class KeywordUtils

	SYNONYM_MAP = { 
		"mt" => "mount" 
	}

	def is_word_integer?(word)
		true if Integer(word) rescue false
	end

	def sanitize_to_keywords(str)
		keywords = str.split(/[^\w'-]+/)
		keywords.each_with_index do |keyword, index|
			puts keyword
			if is_word_integer? keyword
				# convert integer to string equivalent
				keywords[index] = keyword.to_i.humanize
			elsif SYNONYM_MAP[keyword]
				keywords[index] = SYNONYM_MAP[keyword]
			end
		end

		keywords
	end
end
