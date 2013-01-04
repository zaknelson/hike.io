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
			keyword.downcase!
			if is_word_integer? keyword
				# convert integer to string equivalent
				keyword = keyword.to_i.humanize
			elsif SYNONYM_MAP[keyword]
				keyword = SYNONYM_MAP[keyword]
			end
			keywords[index] = keyword
		end

		keywords
	end
end
