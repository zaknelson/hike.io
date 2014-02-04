"use strict";

angular.module("hikeio").
	factory("persistentStorage", ["$window", function($window) {
		/*global Modernizr*/

		var PersistentStorageService = function() {
		};

		PersistentStorageService.prototype.get = function(key) {
			if (!Modernizr.localstorage) {
				return null;
			}
			var value = $window.localStorage.getItem(key);
			if (value === null) {
				return null;
			}
			try {
				return JSON.parse(value);
			} catch (e) {
				// Would like to not use try/catch here but I don't see a clean way of 
				// detecting whether something is valid JSON without just parsing it.
				// http://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
				return value;
			}
		};

		PersistentStorageService.prototype.set = function(key, value) {
			if (!Modernizr.localstorage) {
				return;
			}
			if (value !== null && typeof value === "object") {
				value = JSON.stringify(value);
			}
			$window.localStorage.setItem(key, value);
		};

		PersistentStorageService.prototype.remove = function(key) {
			if (!Modernizr.localstorage) {
				return;
			}
			$window.localStorage.removeItem(key);
		};

		return new PersistentStorageService();
	}]);
