"use strict";

var system = require("system");
if (system.args.length < 2) {
	console.log("Missing arguments.");
	phantom.exit();
}
var url = system.args[1];

// Search engines are getting tripped up on some of the angular magic. For example, it thinks one of the primary keywords
// of the site is string_id. In order to combat this, cleanup some non visible elements from the static html.
var cleanup = function(page) {
	page.evaluate(function () {
		var allElements = document.getElementsByTagName("*");
		var dataPrefix = "data-";
		for (var i = allElements.length - 1; i >= 0; i--) {
			var element = allElements[i];
			var attributes = element.attributes;
			var attributesLength = attributes.length;
			for (var j = attributesLength - 1; j >=0; j--) {
				var attribute = attributes[j].name;
				var attributeValue = attributes[j].value;
				if ((attribute === "type" && attributeValue === "text/ng-template") ||
					(attribute === "data-static-html-hidden" && attributeValue === "true") ||
					attribute === "data-preload-resource") {
					element.parentNode.removeChild(element);
					continue;
				}
				if (attribute.slice(0, dataPrefix.length) === dataPrefix) { // remove if it has the data prefix
					element.removeAttribute(attribute);
				}
			}
		}
	});
};

var renderHtml = function(url) {
	var page = require("webpage").create();
	page.settings.loadImages = false;
	page.settings.localToRemoteUrlAccessEnabled = true;
	page.onCallback = function() {
		setTimeout(function() {
			cleanup(page);
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
	page.viewportSize = { width: 1024, height: 800 };
	setTimeout(function() {
		console.log(page.content);
		phantom.exit();
	}, 10000);
	page.open(url);
};

renderHtml(url);