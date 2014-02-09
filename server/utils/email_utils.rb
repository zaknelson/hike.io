require "diffy"
require "premailer"
require "rest-client"

require_relative "../model/hike"

class EmailUtils

	def self.send_review string_id, body, base_url, title, review=nil
		return if Sinatra::Application.environment() == :test
		api_key = ENV["MAILGUN_API_KEY"]
		api_url = "https://api:#{api_key}@api.mailgun.net/v2/hike.io.mailgun.org"
		html = "<html>"
		html += "<head><style>#{Diffy::CSS}</style></head>"
		html += "<body>"
		html += body
		if review
			html += "<div>"
			html += '<a href="' + "#{base_url}/admin/v1/reviews/#{review.string_id}/accept" + '" style="color: #fff; text-decoration: none; display: inline-block; position: relative; padding-top: 0; padding-right: 20px; padding-bottom: 0; padding-left: 20px; border: 0; font-size: 18px; line-height: 39px; text-align: center; font-style: normal; cursor: pointer; border-bottom: 1px solid rgba(0 , 0 , 0 , 0.1); font-family: sans-serif; border-radius: 3px; background-color: #009900; margin-top: 5px; margin-right: 5px;">Accept</a>'
			html += '<a href="' + "#{base_url}/admin/v1/reviews/#{review.string_id}/reject" + '" style="color: #fff; text-decoration: none; display: inline-block; position: relative; padding-top: 0; padding-right: 20px; padding-bottom: 0; padding-left: 20px; border: 0; font-size: 18px; line-height: 39px; text-align: center; font-style: normal; cursor: pointer; border-bottom: 1px solid rgba(0 , 0 , 0 , 0.1); font-family: sans-serif; border-radius: 3px; background-color: #CC0000; margin-top: 5px; margin-right: 5px;">Reject</a>'
			html += "</div>"
		end
		html += "</body>"
		html += "</html>"
		RestClient.post api_url + "/messages", 
			:from => "review@hike.io.mailgun.org",
			:to => "review@hike.io",
			:subject => "[Review " +  Sinatra::Application.environment().to_s + "] "  + title,
			:html => Premailer.new(html, :with_html_string => true).to_inline_css
	end

	def self.send_new_review(json, string_id, base_url, review=nil)
		new_json = JSON.pretty_generate(json)
		send_review(string_id, new_json, base_url, "New hike", review)
	end

	def self.shorten_route_string route
		route == nil || route.length == 0 ? "" : "Hash=#{route.hash}"
	end

	def self.get_link_from_photo photo
		return photo if !photo
		"http://assets.hike.io/hike-images/" + photo["string_id"] + "-large.jpg"
	end

	def self.add_links_to_all_photos json
		Hike.each_special_photo_key do |key|
			json[key]["string_id"] = get_link_from_photo(json[key])
		end
		json["photos_generic"].each do |photo|
			photo["string_id"] = get_link_from_photo(photo)
		end
	end

	def self.send_diff_review(json, string_id, base_url, review=nil)
		hike = Hike[:string_id => string_id]
		title = "Update for #{string_id}"
		# Because the review process allows users to perform updates on hikes that haven't been
		# created yet, there might not yet be a before.
		before_json = hike ? JSON.parse(hike.as_json) : nil
		after_json = json

		# Diffy has a hard time handling routes since they can be quite large, so truncate them
		before_json["route"] = shorten_route_string(before_json["route"])
		json["route"] = shorten_route_string(json["route"])

		add_links_to_all_photos(before_json)
		add_links_to_all_photos(after_json)

		before_str = before_json ? JSON.pretty_generate(before_json) : ""
		after_str = JSON.pretty_generate(json)
		html = Diffy::Diff.new(before_str, after_str).to_s(:html)
		send_review(string_id, html, base_url, title, review)
	end

	def self.send_delete_review(string_id, base_url, review=nil)
		hike = Hike[:string_id => string_id]
		title = "Delete for #{string_id}"
		body = hike ? "<a href='#{base_url}/hikes/#{hike.string_id}'>#{base_url}/hikes/#{hike.string_id}</a>" : "<p>Hike doesn't yet exist</p>"
		send_review(string_id, body, base_url, title, review)
	end
end