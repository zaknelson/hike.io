require_relative "../model/database"
require_relative "keyword_utils"

class RoutesUtils

	def get_hike_from_id hike_id
		hike = Hike[:string_id => hike_id]
		if not hike and KeywordUtils.new.is_word_integer? hike_id
			hike = Hike[:id => Integer(hike_id)]
		end
		hike
	end
end