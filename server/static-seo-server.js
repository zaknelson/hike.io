"use strict";

var system = require("system");
if (system.args.length < 2) {
	console.log("Missing arguments.");
	phantom.exit();
}
var url = system.args[1];

var renderHtml = function(url) {
	var page = require("webpage").create();
	page.settings.loadImages = false;
	page.settings.localToRemoteUrlAccessEnabled = true;
	page.onCallback = function() {
		setTimeout(function() {
			console.log(page.content);
			phantom.exit();
		}, 100);
	};
	page.onInitialized = function() {
		page.evaluate(function() {
			document.addEventListener("__htmlReady__", function() {
				window.callPhantom();
			}, false);
		});
	};
	setTimeout(function() {
		console.log(page.content);
		phantom.exit();
	}, 10000);
	page.open(url);
};

renderHtml(url)