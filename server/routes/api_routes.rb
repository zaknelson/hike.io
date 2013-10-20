require "sanitize"
require "RMagick"
require "uuidtools"

require_relative "../server"
require_relative "../utils/amazon_utils"
require_relative "../utils/email_utils"
require_relative "../utils/routes_utils"
require_relative "../utils/string_utils"

class HikeApp < Sinatra::Base

	get "/api/v1/hikes", :provides => "json" do
		array_as_json(Hike.order(:id).all, get_fields_filter) 
	end

	post "/api/v1/hikes", :provides => "json" do
		json_str = request.body.read 
		json = JSON.parse json_str rescue return 400
		return 400 if not Hike.is_valid_json? json
		return 409 if Hike[:string_id => Hike.create_string_id_from_name(json["name"])]
		if user_needs_changes_reviewed?
			review = Review.create({
				:api_verb => "post",
				:api_body => json_str,
				:reviewee => current_user_id
			})
			EmailUtils.send_new_review(review, request.base_url + "/admin/v1/reviews/#{review.string_id}") if Sinatra::Application.environment() != :test
			return 202
		end

		hike = Hike.create_from_json json
		hike.as_json
	end

	get "/api/v1/hikes/search", :provides => "json" do
		query = params[:q]
		return 400 if not query

		search_executor = SearchExecutor.new
		search_executor.logger = logger
		search_executor.query = query
		search_results = search_executor.execute

		if (search_executor.has_best_result) 
			array_as_json([search_results[0]], get_fields_filter) 
		else
			array_as_json(search_results, get_fields_filter)
		end
	end

	get "/api/v1/hikes/:hike_id", :provides => "json" do
		hike = RoutesUtils.get_hike_from_id params[:hike_id]
		return 404 if not hike
		hike.as_json get_fields_filter
	end

	put "/api/v1/hikes/:hike_id", :provides => "json" do
		hike = RoutesUtils.get_hike_from_id params[:hike_id]
		json_str = request.body.read
		json = JSON.parse json_str rescue return 400
		return 400 if not Hike.is_valid_json? json

		if user_needs_changes_reviewed?
			review = Review.create({
				:api_verb => "put",
				:api_body => json_str,
				:hike_string_id => params[:hike_id],
				:reviewee => current_user_id
			})
			EmailUtils.send_diff_review(review, request.base_url + "/admin/v1/reviews/#{review.string_id}") if Sinatra::Application.environment() != :test
			return 202
		elsif not hike
			return 404
		end
		hike.update_from_json(json)
		hike.as_json
	end

	post "/api/v1/hikes/:hike_id/photos", :provides => "json" do
		hike = RoutesUtils.get_hike_from_id params[:hike_id]
		uploaded_file = params[:file]
		return 404 if !hike && !user_needs_changes_reviewed?
		return 400 if not uploaded_file
		photo = Photo.create_with_renditions(uploaded_file[:tempfile])
		photo.to_json
	end

	def get_fields_filter
		params[:fields] ? params[:fields].split(",") : nil
	end
end