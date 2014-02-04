"use strict";

angular.module("hikeio").
	factory("navigation", ["$location", function($location) {
		var NavigationService = function() {
		};

		NavigationService.prototype.onAdd = function() {
			return $location.path() === "/add";
		};

		NavigationService.prototype.toSearch = function(query) {
			return $location.url("/search?q=" + query);
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

		NavigationService.prototype.onMap = function() {
			return $location.path() === "/map";
		};

		NavigationService.prototype.toMap = function(urlParams) {
			return $location.url("/map").search(urlParams);
		};

		NavigationService.prototype.toEntry = function(id) {
			return $location.url("/hikes/" + id);
		};

		NavigationService.prototype.toEntryEdit = function(id) {
			return $location.url("/hikes/" + id + "/edit");
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