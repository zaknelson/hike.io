require "aws-sdk"

require_relative "../server"
require_relative "../utils/routes_utils"

class HikeApp < Sinatra::Base

	get "/api/v1/hikes", :provides => "json" do
		Hike.all.to_json
	end

	post "/api/v1/hikes", :provides => "json" do
		json = JSON.parse request.body.read
		string_id = json["name"].downcase.split(" ").join("-")
		hike = Hike.create(
			:string_id => string_id,
			:name => json["name"],
			:locality => json["locality"],
			:distance => json["distance"],
			:elevation_max => json["elevation_max"],
			:creation_time => Time.now,
			:edit_time => Time.now
			);
		hike.location = Location.create(
			:latitude => json["location"]["latitude"],
			:longitude => json["location"]["longitude"]
			);
		hike.save
		hike.to_json
	end

	get "/api/v1/hikes/search", :provides => "json" do
		query = params[:q];
		400 if not query

		search_executor = SearchExecutor.new
		search_executor.logger = logger
		search_executor.query = query
		search_results = search_executor.execute

		if (search_executor.has_best_result) 
			[search_results[0]].to_json
		else
			search_results.to_json
		end
	end

	get "/api/v1/hikes/:hike_id", :provides => "json" do
		hike = RoutesUtils.new.get_hike_from_id params[:hike_id]
		hike.to_json if hike
	end

	put "/api/v1/hikes/:hike_id", :provides => "json" do
		return 403 if not is_admin?
		hike = RoutesUtils.new.get_hike_from_id params[:hike_id]
		return 404 if not hike

		json = JSON.parse request.body.read
		hike.name = json["name"] if json["name"]
		hike.description = json["description"] if json["description"]
		hike.distance = json["distance"] if json["distance"]
		hike.elevation_max = json["elevation_max"] if json["elevation_max"]
		hike.locality = json["locality"] if json["locality"]
		hike.photo_landscape = Photo.find(:string_id => json["photo_landscape"]["string_id"]) if json["photo_landscape"]
		hike.photo_facts = Photo.find(:string_id => json["photo_facts"]["string_id"]) if json["photo_facts"]

		if json["location"] and json["location"]["longitude"] and json["location"]["latitude"]
			if not hike.location
				hike.location = Location.create(
					:latitude => json["location"]["latitude"],
					:longitude => json["location"]["longitude"]
					);
			else
				hike.location.latitude = json["location"]["latitude"]
				hike.location.longitude = json["location"]["longitude"]
				hike.location.save_changes
			end
		end
		hike.save_changes
		hike.to_json
	end

	post "/api/v1/hikes/:hike_id/photos", :provides => "json" do
		hike = RoutesUtils.new.get_hike_from_id params[:hike_id]
		uploaded_file = params[:file]
		name = params[:name]
		alt = params[:alt]
		return 404 if not hike
		return 400 if not name or not uploaded_file or not alt

		#clean up file name parameter
		name = name.end_with?(".jpg") ? name[0, name.length-4] : name
		name = name.split(" ").join("-")
		name = name.gsub(/[^0-9a-z\-]/i, "")

		string_id = params[:hike_id] + "/" + name;

		photo = Photo.create({
			:string_id => string_id,
			:alt => alt
		})

		FileUtils.mkdir_p("tmp")
		temp_file = File.join("tmp", name)
		File.open(temp_file, 'wb') do |file|
			file.write(uploaded_file[:tempfile].read)
		end

		if settings.production?
			s3 = AWS::S3.new(
				:access_key_id     => settings.access_key_id,
				:secret_access_key => settings.secret_access_key
			)
			bucket = s3.buckets["assets.hike.io"]
			object = bucket.objects[string_id + ".jpg"]
			object.write(:file => temp_file)
		else
			dst = self.root + "/public/hike-images/" + string_id + ".jpg"
			dst_dir = File.dirname dst
			FileUtils.mkdir_p(dst_dir)
			FileUtils.cp temp_file, dst
		end

		photo.to_json
	end

end