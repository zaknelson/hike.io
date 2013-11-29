require_relative "database"

migration "seed scotchman peak" do
	hike = Hike.create(
		:string_id => "scotchman-peak",
		:name => "Scotchman Peak",
		:locality => "North Idaho, USA",
		:description => "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce dapibus erat nec elit posuere volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. </p><p>Duis diam nisl, consectetur egestas ornare vitae, viverra a metus. Ut leo velit, pellentesque lobortis placerat sed, ullamcorper sit amet lacus.</p><p>Maecenas mattis, tellus nec pretium interdum, arcu lorem adipiscing elit, in tempor tortor risus sit amet nibh. Nam ultrices nibh ac neque hendrerit et condimentum tellus sollicitudin.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce dapibus erat nec elit posuere volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Duis diam nisl, consectetur egestas ornare vitae, viverra a metus. Ut leo velit, pellentesque lobortis placerat sed, ullamcorper sit amet lacus.Maecenas mattis, tellus nec pretium interdum, arcu lorem adipiscing elit, in tempor tortor risus sit amet nibh. Nam ultrices nibh ac neque hendrerit et condimentum tellus sollicitudin.</p>",
		:distance => 10,
		:elevation_max => 1000,
		:elevation_gain => 550,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.location = Location.create(
		:latitude => 48.177534,
		:longitude => -116.089783
	)

	hike.photo_landscape = Photo.create(:string_id => "scotchman-peak/landscape", :width => 2400, :height => 800, :attribution_link => "http://wikipedia.org")
	hike.photo_preview = Photo.create(:string_id => "scotchman-peak/preview", :width => 2400, :height => 2400, :attribution_link => "http://flickr.com")
	hike.photo_facts = Photo.create(:string_id => "scotchman-peak/facts", :width => 2400, :height => 1594, :attribution_link => "http://google.com")
	hike.add_photos_generic(Photo.create(:string_id => "scotchman-peak/photo1", :width => 2400, :height => 812, :attribution_link => "http://example.com"))
	hike.add_photos_generic(Photo.create(:string_id => "scotchman-peak/photo2", :width => 1594, :height => 2400))
	hike.add_photos_generic(Photo.create(:string_id => "scotchman-peak/photo3", :width => 1594, :height => 2400))
	hike.add_photos_generic(Photo.create(:string_id => "scotchman-peak/photo4", :width => 2400, :height => 2400))

	hike.add_keyword(Keyword.find_or_create(:keyword => "scotchman"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "peak"))

	hike.save
end

migration "seed nakoa trail" do
	hike = Hike.create(
		:string_id => "nakoa-trail",
		:name => "Nakoa Trail",
		:locality => "Hawaii, USA",
		:distance => 10,
		:elevation_max => 1200,
		:elevation_gain => 550,
		:creation_time => Time.now,
		:edit_time => Time.now,
		:permit => '<a href="http://wikipedia.org">Hawaiian Permit</a>'
	)

	hike.location = Location.create(
		:latitude => 21.545,
		:longitude => -157.887
	)

	hike.photo_preview = Photo.create(:string_id => "nakoa-trail/preview", :width => 2400, :height => 2400)

	hike.add_keyword(Keyword.find_or_create(:keyword => "nakoa"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "trail"))

	hike.save
end

migration "seed the narrows" do
	hike = Hike.create(
		:string_id => "the-narrows",
		:name => "The Narrows",
		:locality => "Utah, USA",
		:distance => 22,
		:elevation_max => 5000,
		:elevation_gain => 550,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.location = Location.create(
		:latitude => 37.30669,
		:longitude => -112.94745
	)

	hike.photo_preview = Photo.create(:string_id => "the-narrows/preview", :width => 1594, :height => 2400)

	hike.add_keyword(Keyword.find_or_create(:keyword => "the"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "narrows"))

	hike.save
end


migration "seed empty hike" do
	hike = Hike.create(
		:string_id => "empty",
		:name => "Empty",
		:locality => "Empty, USA",
		:distance => 22,
		:elevation_max => 3500,
		:elevation_gain => 550,
		:creation_time => Time.now,
		:edit_time => Time.now
	)
	
	hike.location = Location.create(
		:latitude => 71.277534,
		:longitude => -118.289783
	)

	hike.add_keyword(Keyword.find_or_create(:keyword => "empty"))

	hike.save
end

migration "seed lake 22" do
	hike = Hike.create(
		:string_id => "lake-22",
		:name => "Lake 22",
		:locality => "Washington, USA",
		:distance => 10,
		:elevation_max => 2400,
		:elevation_gain => 550,
		:creation_time => Time.now,
		:edit_time => Time.now
	)
	
	hike.location = Location.create(
		:latitude => 74.277534,
		:longitude => -123.289783
	)

	hike.add_keyword(Keyword.find_or_create(:keyword => "lake"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "twenty-two"))

	hike.save
end

migration "seed pike's peak" do
	hike = Hike.create(
		:string_id => "pikes-peak",
		:name => "Pike's Peak",
		:locality => "Colorado, USA",
		:distance => 59,
		:elevation_max => 12000,
		:elevation_gain => 550,
		:creation_time => Time.now,
		:edit_time => Time.now
	)
	
	hike.location = Location.create(
		:latitude => 75.277534,
		:longitude => -113.289783
	)

	hike.add_keyword(Keyword.find_or_create(:keyword => "pike's"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "peak"))

	hike.save
end

migration "seed mt. kilimanjaro" do
	hike = Hike.create(
		:string_id => "mt-kilimanjaro",
		:name => "Mount Kilimanjaro",
		:locality => "Tanazania",
		:distance => 100,
		:elevation_max => 15000,
		:elevation_gain => 550,
		:creation_time => Time.now,
		:edit_time => Time.now
	)
	
	hike.location = Location.create(
		:latitude => -75.277534,
		:longitude => -123.289783
	)

	hike.add_keyword(Keyword.find_or_create(:keyword => "mount"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "kilimanjaro"))

	hike.save
end
