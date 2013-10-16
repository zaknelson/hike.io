require_relative "../server"
require_relative "../model/hike"

class HikeApp < Sinatra::Base

	get "/admin/v1/reviews/:review_id", :provides => "json" do
		return 403 if user_needs_changes_reviewed?
		review = Review[:string_id => params[:review_id]]
		review.to_json
	end

	# Ideally this would be a PUT on the review, but since email clients 
	# don't appreciate javascript, a GET seemed like a better option
	get "/admin/v1/reviews/:review_id/accept", :provides => "json" do
		return 403 if user_needs_changes_reviewed?
		review = Review[:string_id => params[:review_id]]
		return 404 if not review
		return 400 if review.api_verb != "put" && review.api_verb != "post"
		return 409 if review.status != Review::STATUS_UNREVIEWED
		review.reviewer = current_user_id
		review.status = Review::STATUS_ACCEPTED
		review.edit_time = Time.now
		review.save_changes

		if review.api_verb == "put"
			hike = Hike[:id => review.hike_id]
			update_hike(hike, JSON.parse(review.api_body)) # defined in api_routes.rb
		elsif review.api_verb == "post" 
			Hike.create_from_json(JSON.parse(review.api_body))
		end

		redirect "/hikes/#{hike.string_id}"
	end

	get "/admin/v1/reviews/:review_id/reject", :provides => "json" do
		return 403 if user_needs_changes_reviewed?
		review = Review[:string_id => params[:review_id]]
		return 404 if not review
		return 400 if review.api_verb != "put" && review.api_verb != "post"
		return 409 if review.status != Review::STATUS_UNREVIEWED
		review.reviewer = current_user_id
		review.status = Review::STATUS_REJECTED
		review.edit_time = Time.now
		review.save_changes

		if review.api_verb == "put"
			hike = Hike[:id => review.hike_id]
			redirect "/hikes/#{hike.string_id}"
		elsif review.api_verb == "post" 
			redirect "/hikes"
		end
	end
end