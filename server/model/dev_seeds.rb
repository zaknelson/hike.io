require_relative "database"

migration "seed scotchman peak" do
	hike = Hike.create(
		:string_id => "scotchman-peak",
		:name => "Scotchman Peak",
		:locality => "North Idaho, USA",
		:description => "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce dapibus erat nec elit posuere volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. </p><p>Duis diam nisl, consectetur egestas ornare vitae, viverra a metus. Ut leo velit, pellentesque lobortis placerat sed, ullamcorper sit amet lacus.</p><p>Maecenas mattis, tellus nec pretium interdum, arcu lorem adipiscing elit, in tempor tortor risus sit amet nibh. Nam ultrices nibh ac neque hendrerit et condimentum tellus sollicitudin.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce dapibus erat nec elit posuere volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Duis diam nisl, consectetur egestas ornare vitae, viverra a metus. Ut leo velit, pellentesque lobortis placerat sed, ullamcorper sit amet lacus.Maecenas mattis, tellus nec pretium interdum, arcu lorem adipiscing elit, in tempor tortor risus sit amet nibh. Nam ultrices nibh ac neque hendrerit et condimentum tellus sollicitudin.</p>",
		:distance => 10,
		:elevation_max => 1000,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.location = Location.create(
		:latitude => 48.177534,
		:longitude => -116.089783
	)

	hike.photo_landscape = Photo.create(:string_id => "scotchman-peak/landscape", :width => 2400, :height => 800)
	hike.photo_preview = Photo.create(:string_id => "scotchman-peak/preview", :width => 2400, :height => 2400)
	hike.photo_facts = Photo.create(:string_id => "scotchman-peak/facts", :width => 2400, :height => 1594)
	hike.add_photos_generic(Photo.create(:string_id => "scotchman-peak/photo1", :width => 2400, :height => 812))
	hike.add_photos_generic(Photo.create(:string_id => "scotchman-peak/photo2", :width => 1594, :height => 2400))
	hike.add_photos_generic(Photo.create(:string_id => "scotchman-peak/photo3", :width => 1594, :height => 2400))
	hike.add_photos_generic(Photo.create(:string_id => "scotchman-peak/photo4", :width => 2400, :height => 2400))

	hike.add_keyword(Keyword.find_or_create(:keyword => "Scotchman"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "Peak"))

	hike.save
end

migration "seed nakoa trail" do
	hike = Hike.create(
		:string_id => "nakoa-trail",
		:name => "Nakoa Trail",
		:locality => "Hawaii, USA",
		:distance => 10,
		:elevation_max => 1200,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.location = Location.create(
		:latitude => 21.545,
		:longitude => -157.887
	)

	hike.photo_preview = Photo.create(:string_id => "nakoa-trail/preview")

	hike.add_keyword(Keyword.find_or_create(:keyword => "Nakoa"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "Trail"))

	hike.save
end

migration "seed the narrows" do
	hike = Hike.create(
		:string_id => "the-narrows",
		:name => "The Narrows",
		:locality => "Utah, USA",
		:distance => 22,
		:elevation_max => 5000,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.location = Location.create(
		:latitude => 37.30669,
		:longitude => -112.94745
	)

	hike.photo_preview = Photo.create(:string_id => "the-narrows/preview")

	hike.add_keyword(Keyword.find_or_create(:keyword => "The"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "Narrows"))

	hike.save
end


migration "seed empty hike" do
	hike = Hike.create(
		:string_id => "empty",
		:name => "Empty",
		:locality => "Empty, USA",
		:distance => 22,
		:elevation_max => 3500,
		:creation_time => Time.now,
		:edit_time => Time.now
	)
	
	hike.location = Location.create(
		:latitude => 71.277534,
		:longitude => -118.289783
	)

	hike.add_keyword(Keyword.find_or_create(:keyword => "Empty"))

	hike.save
end
