"use strict";

angular.module("hikeio").
	factory("search", function($http) {

		var SearchService = function() {
		};
		
		SearchService.prototype.search = function(query) {
			$http({method: "GET", url: "/api/v1/hikes/search", params: { q: query }}).
				success(function(data, status, headers, config) {
					console.log(data);
				}).
				error(function(data, status, headers, config) {
				});
		};

		return new SearchService();
	});
