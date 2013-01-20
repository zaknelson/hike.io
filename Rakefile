require "rake/testtask"

task :default => :run

task :build do
	`psql -h localhost -l | grep -q hikeio || psql -h localhost -c "CREATE DATABASE hikeio"`
end

task :clean do
	`psql -q -h localhost -c "DROP DATABASE hikeio" > /dev/null 2>&1`
	`rm -rf .sass-cache`
end

task :run => [:build] do
	system "npm start &"
	system "rackup -p 4567"
end

task :static do
	output = `node_modules/jshint/bin/hint --config config/jshint.json client/js/*.js client/js/utils/*.js server/*.js`
	if not $?.success?
		puts "----- jshint errors -----"
		puts output
	end
	output = `roodi --config=config/roodi.yml server/**/**/**/**/**/**/**/**/**/**/*.rb`
	if not $?.success?
		puts "----- roodi errors -----"
		puts output
	end
end

task :test => [:build] do
	Rake::TestTask.new do |t|
		t.test_files = FileList["server/test/**/*.rb"]
	end
end