require "sanitize"
require "uuidtools"

require_relative "../server"
require_relative "../utils/amazon_utils"
require_relative "../utils/email_utils"
require_relative "../utils/string_utils"

class HikeApp < Sinatra::Base

	get "/api/v1/hikes", :provides => "json" do
		array_as_json(Hike.order(:id).all, get_fields_filter)
	end

	post "/api/v1/hikes", :provides => "json" do
		json_str = request.body.read 
		json = JSON.parse json_str rescue return err_400("Unable to parse json.")
		field_err = Hike.validate_json_fields(json)
		return err_400(field_err) if field_err
		string_id = Hike.create_string_id_from_name(json["name"])
		return err_400("Invalid hike name.") if string_id.length == 0
		return err_409("Hike already exists.") if Hike[:string_id => string_id]
		if user_needs_changes_reviewed?
			review = Review.create({
				:api_verb => "post",
				:api_body => json_str,
				:hike_string_id => string_id,
				:reviewee => current_user_id
			})
			Thread.new { EmailUtils.send_new_review(json_str, string_id, request.base_url, review) }
			response.headers["Hikeio-Hike-String-Id"] = string_id
			return 202
		end
		Thread.new { EmailUtils.send_new_review(json_str, string_id, request.base_url) }
		hike = Hike.create_from_json json
		hike.as_json
	end

	get "/api/v1/hikes/search", :provides => "json" do
		query = params[:q]
		return err_400 if not query

		search_executor = SearchExecutor.new
		search_executor.logger = logger
		search_executor.query = query
		search_results = search_executor.execute

		if (search_executor.has_best_result) 
			array_as_json([search_results[0]]) 
		else
			array_as_json(search_results, get_fields_filter)
		end
	end

	get "/api/v1/hikes/:hike_id", :provides => "json" do
		before = Time.now
		hike = Hike.get_hike_from_id params[:hike_id]
		if not hike
			return 202 if Review[:status => Review::STATUS_UNREVIEWED, :hike_string_id => params[:hike_id], :api_verb => "post"]
			return err_404
		end
		hike.as_json get_fields_filter
	end

	put "/api/v1/hikes/:hike_id", :provides => "json" do
		hike_id = params[:hike_id]
		hike = Hike.get_hike_from_id hike_id
		json_str = request.body.read
		json = JSON.parse json_str rescue return err_400("Unable to parse json.")
		field_err = Hike.validate_json_fields(json)
		return err_400(field_err) if field_err
		return err_409("Hike with that id already exists.") if json["string_id"] && json["string_id"] != hike_id && Hike.get_hike_from_id(json["string_id"])
		return err_404 if !hike && !Review.has_pending_review_for_hike?(hike_id)
		if user_needs_changes_reviewed? 
			review = Review.create({
				:api_verb => "put",
				:api_body => json_str,
				:hike_string_id => hike_id,
				:reviewee => current_user_id
			})
			Thread.new { EmailUtils.send_diff_review(json_str, hike_id, request.base_url, review) }
			json["description"] = Hike.clean_html_input(json["description"])
			return 202, json.to_json
		end
		return err_409("Update conflicts with another change.") if hike.edit_time.to_s != json["edit_time"]
		Thread.new { EmailUtils.send_diff_review(json_str, hike_id, request.base_url) }
		hike.update_from_json(json)
		hike.as_json
	end

	delete "/api/v1/hikes/:hike_id", :provides => "json" do
		hike_id = params[:hike_id]
		hike = Hike.get_hike_from_id hike_id
		if user_needs_changes_reviewed?
			review = Review.create({
				:api_verb => "delete",
				:hike_string_id => hike_id,
				:reviewee => current_user_id
			})
			Thread.new { EmailUtils.send_delete_review(hike_id, request.base_url, review) }
			return 202
		elsif not hike
			return err_404
		end
		Thread.new { EmailUtils.send_delete_review(hike_id, request.base_url) }
		hike.cascade_destroy
		return 200
	end

	post "/api/v1/hikes/:hike_id/photos", :provides => "json" do
		hike = Hike.get_hike_from_id params[:hike_id]
		uploaded_file = params[:file]
		return err_404 if !hike && !user_needs_changes_reviewed?
		return err_400 if not uploaded_file
		photo = Photo.create_with_renditions(uploaded_file[:tempfile], params[:type] == "landscape")
		photo.to_json
	end

	def get_fields_filter
		params[:fields] ? params[:fields].split(",") : nil
	end
end