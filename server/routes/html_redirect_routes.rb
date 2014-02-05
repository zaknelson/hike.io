require_relative "../server"

# Sometimes hike id's are changed, redirect to correct route if we encounter one of those routes.
# TODO: this really belongs in the db (although have to be careful with string id's that change multiple times)
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

	get "/hikes/white-dotwhite-cross-trail-mt-monadnock", :provides => "html" do
		redirect "/hikes/white-dot-white-cross", 301
	end

	get "/hikes/magoebaskloof-trail", :provides => "html" do
		redirect "/hikes/magoebaskloof", 301
	end

	get "/hikes/westcoast-trail", :provides => "html" do
		redirect "/hikes/west-coast-trail", 301
	end

	get "/hikes/w-circuit-torres-del-paine", :provides => "html" do
		redirect "/hikes/w-circuit", 301
	end
end