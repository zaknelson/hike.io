require_relative "../server"
require_relative "../utils/routes_utils"

class HikeApp < Sinatra::Base

	get "/api/v1/hikes", :provides => "json" do
		Hike.all.to_json
	end

	get "/api/v1/hikes/:hike_id", :provides => "json" do
		hike = RoutesUtils.new.get_hike_from_id params[:hike_id]
		hike.to_json if hike
	end

	put "/api/v1/hikes/:hike_id", :provides => "json" do
		if is_admin?
			hike = RoutesUtils.new.get_hike_from_id params[:hike_id]
			if hike
				hike.from_json request.body.read, :fields => ["name", "description", "distance", "elevation_gain", "locality"], :missing => :skip
				hike.save_changes
				hike.to_json
			end
		else
			403
		end
	end
end