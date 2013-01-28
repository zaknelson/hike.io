require "rubygems"
require "json"

require_relative "utils"

json_string = request("http://www.wta.org/go-hiking/map/@@trailhead-search/getHikes?jsonp_callback=WtaTrailheadSearch.setHikes").text
json_string = json_string["WtaTrailheadSearch.setHikes(".length...-1]
json = JSON.parse json_string

entries = []
json.each do |external_entry|
	if 	external_entry["name"] and
		external_entry["length"] and
		external_entry["elevGain"] and
		external_entry["elevMax"] and
		external_entry["lat"] and
		external_entry["lng"] and
		
		new_entry = { 
			:name => external_entry["name"],
			:distance => external_entry["length"],
			:elevation_gain => external_entry["elevGain"],
			:elevation_max => external_entry["elevMax"],
			:location => { 
				:lat => external_entry["lat"], 
				:lng => external_entry["lng"]
			},
		}

		entries.push new_entry
	end
end

FileUtils.mkdir "output", :noop => true
output_file = File.open "output/wa.json", "w"
output_file.write JSON.pretty_generate(entries)