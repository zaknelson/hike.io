require_relative "../model/database"
require_relative "string_utils"

class RoutesUtils

	def get_hike_from_id hike_id
		hike = Hike[:string_id => hike_id]
		if not hike and StringUtils.new.is_integer? hike_id
			hike = Hike[:id => Integer(hike_id)]
		end
		hike
	end
end