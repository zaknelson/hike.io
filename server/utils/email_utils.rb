require "diffy"
require "premailer"
require "rest-client"

require_relative "../model/hike"

class EmailUtils

	def self.send_review string_id, body, base_url, title, needs_review
		api_key = ENV["MAILGUN_API_KEY"]
		api_url = "https://api:#{api_key}@api.mailgun.net/v2/hike.io.mailgun.org"
		html = "<html>"
		html += "<head><style>#{Diffy::CSS}</style></head>"
		html += "<body>"
		html += body
		if needs_review
			html += "<div>"
			html += '<a href="' + "#{base_url}/admin/v1/reviews/#{string_id}/accept" + '" style="color: #fff; text-decoration: none; display: inline-block; position: relative; padding-top: 0; padding-right: 20px; padding-bottom: 0; padding-left: 20px; border: 0; font-size: 18px; line-height: 39px; text-align: center; font-style: normal; cursor: pointer; border-bottom: 1px solid rgba(0 , 0 , 0 , 0.1); font-family: sans-serif; border-radius: 3px; background-color: #009900; margin-top: 5px; margin-right: 5px;">Accept</a>'
			html += '<a href="' + "#{base_url}/admin/v1/reviews/#{string_id}/reject" + '" style="color: #fff; text-decoration: none; display: inline-block; position: relative; padding-top: 0; padding-right: 20px; padding-bottom: 0; padding-left: 20px; border: 0; font-size: 18px; line-height: 39px; text-align: center; font-style: normal; cursor: pointer; border-bottom: 1px solid rgba(0 , 0 , 0 , 0.1); font-family: sans-serif; border-radius: 3px; background-color: #CC0000; margin-top: 5px; margin-right: 5px;">Reject</a>'
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

	def self.send_new_review(json_str, string_id, base_url, needs_review)
		new_json = JSON.pretty_generate(JSON.parse(json_str))
		send_review(string_id, new_json, base_url, "New hike", needs_review)
	end

	def self.send_diff_review(json_str, string_id, base_url, needs_review)
		hike = Hike[:string_id => string_id]
		title = "Update for #{string_id}"
		# Because the review process allows users to perform updates on hikes that haven't been
		# created yet, there might not yet be a before.
		before = hike ? JSON.pretty_generate(JSON.parse(hike.as_json)) : ""
		after = JSON.pretty_generate(JSON.parse(json_str))
		html = Diffy::Diff.new(before, after).to_s(:html)
		send_review(string_id, html, base_url, title, needs_review)
	end

	def self.send_delete_review(string_id, base_url, needs_review)
		hike = Hike[:string_id => string_id]
		title = "Delete for #{string_id}"
		body = hike ? "<a href='#{base_url}/hikes/#{hike.string_id}'>#{base_url}/hikes/#{hike.string_id}</a>" : "<p>Hike doesn't yet exist</p>"
		send_review(string_id, body, base_url, title, needs_review)
	end
end