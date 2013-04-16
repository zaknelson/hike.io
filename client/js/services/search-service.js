"use strict";

angular.module("hikeio").
	factory("search", function($http, $log, navigation) {

		var SearchService = function() {
		};
		
		SearchService.prototype.search = function(query) {
			$http({method: "GET", url: "/api/v1/hikes/search", params: { q: query }}).
				success(function(data, status, headers, config) {
					if (data.length === 1) {
						navigation.toEntry(data[0].hike.string_id);
					}
				}).
				error(function(data, status, headers, config) {
					$log.error(data, status, headers, config)
				});
		};

		return new SearchService();
	});
