"use strict";

angular.module("hikeio").
	factory("search", function($http, $location) {

		var SearchService = function() {
		};
		
		SearchService.prototype.search = function(query) {
			$http({method: "GET", url: "/api/v1/hikes/search", params: { q: query }}).
				success(function(data, status, headers, config) {
					if (data.length === 1) {
						$location.path("/hikes/" + data[0].hike.string_id)
					}
				}).
				error(function(data, status, headers, config) {
					console.log(data)
				});
		};

		return new SearchService();
	});
