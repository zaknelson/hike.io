require "diffy"
require "premailer"
require "rest-client"

require_relative "../model/hike"

class EmailUtils

	def self.send_review body, base_url, title=""
		api_key = ENV["MAILGUN_API_KEY"]
		api_url = "https://api:#{api_key}@api.mailgun.net/v2/hike.io.mailgun.org"
		html = "<html>"
		html += "<head><style>#{Diffy::CSS}</style></head>"
		html += "<body>"
		html += body
		html += "<div>"
		html += '<a href="' + "#{base_url}/accept" + '" style="color: #fff; text-decoration: none; display: inline-block; position: relative; padding-top: 0; padding-right: 20px; padding-bottom: 0; padding-left: 20px; border: 0; font-size: 18px; line-height: 39px; text-align: center; font-style: normal; cursor: pointer; border-bottom: 1px solid rgba(0 , 0 , 0 , 0.1); font-family: sans-serif; border-radius: 3px; background-color: #009900; margin-top: 5px; margin-right: 5px;">Accept</a>'
		html += '<a href="' + "#{base_url}/reject" + '" style="color: #fff; text-decoration: none; display: inline-block; position: relative; padding-top: 0; padding-right: 20px; padding-bottom: 0; padding-left: 20px; border: 0; font-size: 18px; line-height: 39px; text-align: center; font-style: normal; cursor: pointer; border-bottom: 1px solid rgba(0 , 0 , 0 , 0.1); font-family: sans-serif; border-radius: 3px; background-color: #CC0000; margin-top: 5px; margin-right: 5px;">Reject</a>'
		html += "</div>"
		html += "</body>"
		html += "</html>"
		RestClient.post api_url + "/messages", 
			:from => "review@hike.io.mailgun.org",
			:to => "review@hike.io",
			:subject => "[REVIEW] " + title,
			:html => Premailer.new(html, :with_html_string => true).to_inline_css
	end

	def self.send_new_review(review, base_url)
		new_json = JSON.pretty_generate(JSON.parse(review.api_body))
		send_review(new_json, base_url, "New hike")
	end

	def self.send_diff_review(review, base_url)
		hike = Hike[:id => review.hike_id]
		before = JSON.pretty_generate(JSON.parse(hike.as_json))
		after = JSON.pretty_generate(JSON.parse(review.api_body))
		html = Diffy::Diff.new(before, after).to_s(:html)
		send_review(html, base_url, hike.name)
	end
end