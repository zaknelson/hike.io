module.exports = function(config){
		config.set({
		basePath: "../client/js",
		files: [
			/* External dependencies from layout.erb */
			"http://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.0/jquery.min.js",
			"http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.1.4/angular.min.js",
			"http://cdnjs.cloudflare.com/ajax/libs/angular-ui/0.4.0/angular-ui.min.js",
			"http://cdnjs.cloudflare.com/ajax/libs/socket.io/0.9.16/socket.io.min.js",
			"http://www.google.com/jsapi",
			"test/lib/*.js",
			"main.js",
			"**/*.js"
		],
		singleRun: true,
		frameworks: ["jasmine"],
		browsers : ["PhantomJS"],
		plugins: ["karma-jasmine", "karma-phantomjs-launcher"]

})}
