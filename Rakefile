require "rake/testtask"

task :default => :run

task :backup do
	date = Time.now.strftime("%F")
	backup_dir = "backup/#{date}"
	FileUtils.mkdir_p(backup_dir)
	`heroku pgbackups:capture --expire`
  	`curl -s -o #{backup_dir}/db.dump \`heroku pgbackups:url\``
  	`s3cmd sync s3://assets.hike.io/ #{backup_dir}`
end

task :build do
	`psql -h localhost -l | grep -q hikeio || psql -h localhost -c "CREATE DATABASE hikeio"`
end

task :clean do
	`psql -q -h localhost -c "DROP DATABASE hikeio" > /dev/null 2>&1`
	`rm -rf .sass-cache`
end

task :push => [:clean, :static, :test] do
	`git push heroku master`
end

task :run => [:build] do
	system "rackup -p 4567"
end

task :static do
	output = `node_modules/jshint/bin/jshint --config config/jshint.json \`find . -name "*.js" | grep -v -E "/lib/|/node_modules/" \``
	if not $?.success?
		puts "----- jshint errors -----"
		puts output
		exit
	end
	output = `roodi --config=config/roodi.yml server/**/**/**/**/**/**/**/**/**/**/*.rb`
	if not $?.success?
		puts "----- roodi errors -----"
		puts output
		exit
	end
end

task :test => [:build] do
	Rake::TestTask.new do |t|
		t.test_files = FileList["server/test/**/*.rb"]
	end
end