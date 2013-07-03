"use strict";

var system = require("system");
if (system.args.length < 2) {
	console.log("Missing arguments.");
	phantom.exit();
}
var url = system.args[1];

var renderHtml = function(url, cb) {
	var page = require("webpage").create();
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
	page.onInitialized = function() {
		page.evaluate(function() {
			document.addEventListener("__htmlReady__", function() {
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

renderHtml(url, function(html) {
	console.log(html);
	phantom.exit();
});