"use strict";

angular.module("hikeio").
	factory("navigation", ["$location", function($location) {
		var NavigationService = function() {
		};

		NavigationService.prototype.onAdd = function() {
			return $location.path() === "/add";
		};

		NavigationService.prototype.toSearch = function(query) {
			$location.url("/search?q=" + query);
		};

		NavigationService.prototype.toIndex = function() {
			return $location.url("/");
		};

		NavigationService.prototype.toDiscover = function() {
			return $location.url("/discover");
		};

		NavigationService.prototype.onIndex = function() {
			return $location.path() === "/";
		};

		NavigationService.prototype.onAbout = function() {
			return $location.path() === "/about";
		};

		NavigationService.prototype.toEntry = function(id) {
			$location.url("/hikes/" + id);
		};

		NavigationService.prototype.toEntryEdit = function(id) {
			$location.url("/hikes/" + id + "/edit");
		};

		NavigationService.prototype.onEntry = function() {
			var regex = /\/hikes\/(?!.*\/edit$)/;
			return regex.test($location.path());
		};

		NavigationService.prototype.onEntryEdit = function() {
			var regex = /\/hikes\/.*?\/edit/;
			return regex.test($location.path());
		};

		return new NavigationService();
	}]);