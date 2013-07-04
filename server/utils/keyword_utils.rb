require "humanize"
require_relative "string_utils"

class KeywordUtils

	SYNONYM_MAP = { 
		"mt" => "mount" 
	}

	def sanitize_to_keywords(str)
		keywords = str.split(/[^\w'-]+/)
		keywords.each_with_index do |keyword, index|
			keyword.downcase!
			if StringUtils.new.is_integer? keyword
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
