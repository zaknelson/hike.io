require_relative "database"

migration "seed scotchman peak" do
	entry = Entry.create(
		:string_id => "scotchman-peak",
		:name => "Scotchman Peak",
		:distance => 10,
		:elevation_gain => 1000,
		:creation_time => Time.now,
		:edit_time => Time.now
		)

	entry.add_location(Location.create(
		:name => "North Idaho, USA",
		:latitude => 48.177534,
		:longitude => -116.089783,
		:map_href => "https://maps.google.com/maps?q=Scotchman's+Peak,+ID+83811&hl=en&sll=48.177534,-116.089783&sspn=0.489924,0.495071&t=h&hq=Scotchman's+Peak,&hnear=Clark+Fork,+Bonner,+Idaho&ie=UTF8&ll=48.166314,-116.06987&spn=0.245015,0.247536&z=12&vpsrc=6&cid=1851277074294752467&iwloc=A"
		))

	entry.add_photo(Photo.create(:path => "scotchman-peak-trees"))
	entry.add_photo(Photo.create(:path => "scotchman-peak-mountain-goat"))
	entry.add_photo(Photo.create(:path => "scotchman-peak-wildflower"))
	entry.add_photo(Photo.create(:path => "scotchman-peak-meadow"))
	entry.add_photo(Photo.create(:path => "scotchman-peak-pend-orielle"))
	entry.add_photo(Photo.create(:path => "scotchman-peak-zak"))
	entry.add_photo(Photo.create(:path => "scotchman-peak-hikers"))
	entry.add_photo(Photo.create(:path => "scotchman-peak-dead-tree"))

	entry.add_keyword(Keyword.create(:keyword => "Scotchman"))
	entry.add_keyword(Keyword.create(:keyword => "Peak"))
end

migration "seed mt kilamanjaro" do
	entry = Entry.create(
		:string_id => "mt-kilimanjaro",
		:name => "Mt. Kilimanjaro",
		:distance => 50,
		:elevation_gain => 10500,
		:creation_time => Time.now,
		:edit_time => Time.now
		)

	entry.add_location(Location.create(
		:name => "Tanzania",
		:latitude => 58.177534,
		:longitude => -120.089783,
		:map_href => "https://maps.google.com/maps?q=Scotchman's+Peak,+ID+83811&hl=en&sll=48.177534,-116.089783&sspn=0.489924,0.495071&t=h&hq=Scotchman's+Peak,&hnear=Clark+Fork,+Bonner,+Idaho&ie=UTF8&ll=48.166314,-116.06987&spn=0.245015,0.247536&z=12&vpsrc=6&cid=1851277074294752467&iwloc=A"
		))

	entry.add_keyword(Keyword.create(:keyword => "Kilimanjaro"))
end

migration "seed lake 22" do
	entry = Entry.create(
		:string_id => "lake-22",
		:name => "Lake 22",
		:distance => 18,
		:elevation_gain => 2500,
		:creation_time => Time.now,
		:edit_time => Time.now
		)

	entry.add_location(Location.create(
		:name => "Washington, USA",
		:latitude => 58.177534,
		:longitude => -118.089783,
		:map_href => "https://maps.google.com/maps?q=Scotchman's+Peak,+ID+83811&hl=en&sll=48.177534,-116.089783&sspn=0.489924,0.495071&t=h&hq=Scotchman's+Peak,&hnear=Clark+Fork,+Bonner,+Idaho&ie=UTF8&ll=48.166314,-116.06987&spn=0.245015,0.247536&z=12&vpsrc=6&cid=1851277074294752467&iwloc=A"
		))
end

migration "seed pikes peak" do
	entry = Entry.create(
		:string_id => "pikes-peak",
		:name => "Pike's Peak",
		:distance => 28,
		:elevation_gain => 3500,
		:creation_time => Time.now,
		:edit_time => Time.now
		)

	entry.add_location(Location.create(
		:name => "Colorado, USA",
		:latitude => 58.277534,
		:longitude => -118.289783,
		:map_href => "https://maps.google.com/maps?q=Scotchman's+Peak,+ID+83811&hl=en&sll=48.177534,-116.089783&sspn=0.489924,0.495071&t=h&hq=Scotchman's+Peak,&hnear=Clark+Fork,+Bonner,+Idaho&ie=UTF8&ll=48.166314,-116.06987&spn=0.245015,0.247536&z=12&vpsrc=6&cid=1851277074294752467&iwloc=A"
		))
end

migration "seed north kaibab trail" do
	entry = Entry.create(
		:string_id => "north-kaibab-trail",
		:name => "North Kaibab Trail",
		:distance => 22,
		:elevation_gain => 3500,
		:creation_time => Time.now,
		:edit_time => Time.now
		)

	entry.add_location(Location.create(
		:name => "Colorado, USA",
		:latitude => 70.277534,
		:longitude => -118.289783,
		:map_href => "https://maps.google.com/maps?q=Scotchman's+Peak,+ID+83811&hl=en&sll=48.177534,-116.089783&sspn=0.489924,0.495071&t=h&hq=Scotchman's+Peak,&hnear=Clark+Fork,+Bonner,+Idaho&ie=UTF8&ll=48.166314,-116.06987&spn=0.245015,0.247536&z=12&vpsrc=6&cid=1851277074294752467&iwloc=A"
		))
end

migration "seed king arthurs seat" do
	entry = Entry.create(
		:string_id => "king-arthurs-seat",
		:name => "King Arthur's Seat",
		:distance => 22,
		:elevation_gain => 3500,
		:creation_time => Time.now,
		:edit_time => Time.now
		)

	entry.add_location(Location.create(
		:name => "Edinburgh, Scotland",
		:latitude => 71.277534,
		:longitude => -118.289783,
		:map_href => "https://maps.google.com/maps?q=Scotchman's+Peak,+ID+83811&hl=en&sll=48.177534,-116.089783&sspn=0.489924,0.495071&t=h&hq=Scotchman's+Peak,&hnear=Clark+Fork,+Bonner,+Idaho&ie=UTF8&ll=48.166314,-116.06987&spn=0.245015,0.247536&z=12&vpsrc=6&cid=1851277074294752467&iwloc=A"
		))
end


migration "seed snoqualmie middle fork" do
	entry = Entry.create(
		:string_id => "snoqualmie-middle-fork",
		:name => "Snoqualmie Middle Fork",
		:distance => 22,
		:elevation_gain => 3500,
		:creation_time => Time.now,
		:edit_time => Time.now
		)

	entry.add_location(Location.create(
		:name => "Washington, USA",
		:latitude => 72.277534,
		:longitude => -118.289783,
		:map_href => "https://maps.google.com/maps?q=Scotchman's+Peak,+ID+83811&hl=en&sll=48.177534,-116.089783&sspn=0.489924,0.495071&t=h&hq=Scotchman's+Peak,&hnear=Clark+Fork,+Bonner,+Idaho&ie=UTF8&ll=48.166314,-116.06987&spn=0.245015,0.247536&z=12&vpsrc=6&cid=1851277074294752467&iwloc=A"
		))
end

