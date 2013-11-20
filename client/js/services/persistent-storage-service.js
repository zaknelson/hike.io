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
			return JSON.parse($window.localStorage.getItem(key));
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
