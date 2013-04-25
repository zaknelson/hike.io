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

	hike.photo_landscape = Photo.create(:string_id => "scotchman-peak-landscape")
	hike.photo_preview = Photo.create(:string_id => "scotchman-peak-preview")
	hike.photo_facts = Photo.create(:string_id => "scotchman-peak-facts")

	hike.add_photo(Photo.create(:string_id => "scotchman-peak-mountain-goat"))
	hike.add_photo(Photo.create(:string_id => "scotchman-peak-wildflower"))
	hike.add_photo(Photo.create(:string_id => "scotchman-peak-meadow"))
	hike.add_photo(Photo.create(:string_id => "scotchman-peak-pend-orielle"))
	hike.add_photo(Photo.create(:string_id => "scotchman-peak-zak"))
	hike.add_photo(Photo.create(:string_id => "scotchman-peak-hikers"))

	hike.add_keyword(Keyword.find_or_create(:keyword => "Scotchman"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "Peak"))

	hike.add_map(Map.create(:image_path => "scotchman-peak-topographic-map.jpg"))

	hike.save
end

migration "seed mt kilamanjaro" do
	hike = Hike.create(
		:string_id => "mt-kilimanjaro",
		:name => "Mt. Kilimanjaro",
		:locality => "Tanzania",
		:distance => 50,
		:elevation_max => 10500,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.location = Location.create(
		:latitude => 58.177534,
		:longitude => -120.089783
	)

	hike.photo_landscape = Photo.create(:string_id => "mt-kilimanjaro-landscape")
	hike.photo_preview = Photo.create(:string_id => "mt-kilimanjaro-preview")
	hike.photo_facts = Photo.create(:string_id => "mt-kilimanjaro-facts")

	hike.add_keyword(Keyword.find_or_create(:keyword => "Mount"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "Kilimanjaro"))

	hike.save
end

migration "seed lake 22" do
	hike = Hike.create(
		:string_id => "lake-22",
		:name => "Lake 22",
		:locality => "Washington, USA",
		:distance => 18,
		:elevation_max => 2500,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.location = Location.create(
		:latitude => 58.177534,
		:longitude => -118.089783
	)

	hike.photo_landscape = Photo.create(:string_id => "lake-22-landscape")
	hike.photo_preview = Photo.create(:string_id => "lake-22-preview")

	hike.add_keyword(Keyword.find_or_create(:keyword => "Lake"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "Twenty-two"))

	hike.save
end

migration "seed pikes peak" do
	hike = Hike.create(
		:string_id => "pikes-peak",
		:name => "Pike's Peak",
		:locality => "Colorado, USA",
		:distance => 28,
		:elevation_max => 3500,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.location = Location.create(
		:latitude => 58.277534,
		:longitude => -118.289783
	)

	hike.photo_landscape = Photo.create(:string_id => "pikes-peak-landscape")
	hike.photo_preview = Photo.create(:string_id => "pikes-peak-preview")

	hike.add_keyword(Keyword.find_or_create(:keyword => "Pike's"))
	hike.add_keyword(Keyword.find_or_create(:keyword => "Peak"))

	hike.save
end

migration "seed north kaibab trail" do
	hike = Hike.create(
		:string_id => "north-kaibab-trail",
		:name => "North Kaibab Trail",
		:locality => "Colorado, USA",
		:distance => 22,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.location = Location.create(
		:latitude => 70.277534,
		:longitude => -118.289783
	)

	hike.photo_landscape = Photo.create(:string_id => "north-kaibab-trail-landscape")
	hike.photo_preview = Photo.create(:string_id => "north-kaibab-trail-preview")

	hike.save
end

migration "seed king arthurs seat" do
	hike = Hike.create(
		:string_id => "king-arthurs-seat",
		:name => "King Arthur's Seat",
		:locality => "Edinburgh, Scotland",
		:distance => 22,
		:elevation_max => 3500,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.location = Location.create(
		:latitude => 71.277534,
		:longitude => -118.289783
	)

	hike.photo_landscape = Photo.create(:string_id => "king-arthurs-seat-landscape")
	hike.photo_preview = Photo.create(:string_id => "king-arthurs-seat-preview")

	hike.save
end


migration "seed snoqualmie middle fork" do
	hike = Hike.create(
		:string_id => "snoqualmie-middle-fork",
		:name => "Snoqualmie Middle Fork",
		:locality => "Washington, USA",
		:distance => 22,
		:elevation_max => 3500,
		:creation_time => Time.now,
		:edit_time => Time.now
	)

	hike.photo_landscape = Photo.create(:string_id => "snoqualmie-middle-fork-landscape")
	hike.photo_preview = Photo.create(:string_id => "snoqualmie-middle-fork-preview")

	hike.location = Location.create(
		:latitude => 71.277534,
		:longitude => -118.289783
	)
	hike.save
end

