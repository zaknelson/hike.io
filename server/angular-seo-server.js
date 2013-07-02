var system = require('system');

if (system.args.length < 3) {
	console.log("Missing arguments.");
	phantom.exit();
}

var server = require('webserver').create();
var port = parseInt(system.args[1]);
var urlPrefix = system.args[2];

var renderHtml = function(url, cb) {
	var page = require('webpage').create();
	var finished = false;
	page.settings.loadImages = false;
	page.settings.localToRemoteUrlAccessEnabled = true;
	page.onCallback = function() {
		setTimeout(function() {
			if (!finished) {
				cb(page.content);
				page.close();
				finished = true;
			}
		}, 100);
	};
	page.onConsoleMessage = function(msg, lineNum, sourceId) {
		console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
	};
	page.onInitialized = function() {
		page.evaluate(function() {
			document.addEventListener('__htmlReady__', function() {
				window.callPhantom();
			}, false);
		});
	};
	page.open(url);

	setTimeout(function() {
		if (!finished) {
			cb(page.content);
			page.close();
			finished = true;
		}
	}, 10000);
};

server.listen(port, function (request, response) {
	renderHtml(urlPrefix + request.url, function(html) {
		response.statusCode = 200;
		response.write(html);
		response.close();
	});
});

// Warm up cache
renderHtml(urlPrefix, function(){
});
