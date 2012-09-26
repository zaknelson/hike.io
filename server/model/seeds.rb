require_relative "database"

migration "seed scotchman peak" do
	scotchman_entry = Entry.create(
		:string_id => "scotchman-peak",
		:name => "Scotchman Peak",
		:distance => 10,
		:elevation_gain => 1000,
		:creation_time => Time.now,
		:edit_time => Time.now
		)

	scotchman_entry.add_location(Location.create(
		:name => "North Idaho, USA",
		:latitude => 48.177534,
		:longitude => -116.089783,
		:map_href => "https://maps.google.com/maps?q=Scotchman's+Peak,+ID+83811&hl=en&sll=48.177534,-116.089783&sspn=0.489924,0.495071&t=h&hq=Scotchman's+Peak,&hnear=Clark+Fork,+Bonner,+Idaho&ie=UTF8&ll=48.166314,-116.06987&spn=0.245015,0.247536&z=12&vpsrc=6&cid=1851277074294752467&iwloc=A"
		))

	scotchman_entry.add_photo(Photo.create(:path => "scotchman-peak-trees"))
	scotchman_entry.add_photo(Photo.create(:path => "scotchman-peak-mountain-goat"))
	scotchman_entry.add_photo(Photo.create(:path => "scotchman-peak-wildflower"))
	scotchman_entry.add_photo(Photo.create(:path => "scotchman-peak-meadow"))
	scotchman_entry.add_photo(Photo.create(:path => "scotchman-peak-pend-orielle"))
	scotchman_entry.add_photo(Photo.create(:path => "scotchman-peak-zak"))
	scotchman_entry.add_photo(Photo.create(:path => "scotchman-peak-hikers"))
	scotchman_entry.add_photo(Photo.create(:path => "scotchman-peak-dead-tree"))
end

