require_relative "../server"

# Sometimes hike id's are changed, redirect to correct route if we encounter one of those routes.
# TODO: consider moving this into the db
class HikeApp < Sinatra::Base

	get "/hikes/scotchman-peak-trail-65", :provides => "html" do
		redirect "/hikes/scotchman-peak", 301
	end

	get "/hikes/mt-meru", :provides => "html" do
		redirect "/hikes/mount-meru", 301
	end

	get "/hikes/ghorepani-gandruk-loop-6-days", :provides => "html" do
		redirect "/hikes/ghorepani-ghandruk", 301
	end

	get "/hikes/hanakapai-falls", :provides => "html" do
		redirect "/hikes/hanakapiai-falls", 301
	end
end