"use strict";

angular.module("hikeio").
	factory("navigation", ["$location", function($location) {
		var NavigationService = function() {
		};

		NavigationService.prototype.toEntry = function(id) {
			$location.path("/hikes/" + id);
		};

		NavigationService.prototype.onIndex = function() {
			return $location.path() === "/";
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