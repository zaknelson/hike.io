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
	sh "npm start &"
	sh "ruby server.rb"
end

task :test => [:build] do
	Rake::TestTask.new do |t|
		t.test_files = FileList["server/test/**/*.rb"]
	end
end