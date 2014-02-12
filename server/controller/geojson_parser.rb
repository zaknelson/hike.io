class GeoJSONParser
	# Quick and dirty way to parse GeoJSON we're getting from the client, this is by no means a real GeoJSON parser.
	def self.parse(geojson)
		begin
			author = geojson["features"][0]["properties"]["attribution"]["author"]
			license_link = geojson["features"][0]["properties"]["attribution"]["license_link"]
		rescue
			author = "hike.io"
			license_link = "http://hike.io"
		end
		begin
			track_points = []
			coordinates = geojson["features"][0]["geometry"]["coordinates"]
			coordinates.each do |coordinate|
				track_points.push({
					:longitude => coordinate[0],
					:latitude => coordinate[1],
					:elevation => coordinate[2]
				})
			end
		rescue
			track_points = []
		end
		{
			:attribution_author => author,
			:attribution_license_link => license_link,
			:track_points => track_points
		}
	end
end