require "rubygems"
require "json"
require "open-uri"

require_relative "../../server/model/database"
require_relative "../../server/utils/keyword_utils"

Dir.foreach("output") do |output_file|
	next if output_file == "." or output_file == ".."
	json_string = File.open("output/#{output_file}", "rb").read
	json = JSON.parse(json_string)
	json.each do |entry|
		json_location = entry["location"]
		entry.delete "location"

		entry[:string_id] = URI::encode(entry["name"].downcase.split(" ").join("-"))
		next if Hike.find(:string_id => entry[:string_id])

		entry[:creation_time] = Time.now
		entry[:edit_time] = Time.now

		hike = Hike.create(entry)
		location = Location.find(:latitude => json_location["lat"], :longitude => json_location["lng"])
		if not location
			location = Location.create(:latitude => json_location["lat"], :longitude => json_location["lng"])
		end
		hike.location = location

		keywords = KeywordUtils.new.sanitize_to_keywords entry["name"];
		keywords.each do |keyword|
			begin
				# TODO find a way to check whether this hike already has this keyword 
				hike.add_keyword(Keyword.find_or_create(:keyword => keyword))
			rescue
			end
		end

		hike.save
	end
end