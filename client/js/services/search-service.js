"use strict";

angular.module("hikeio").
	factory("search", ["$http", "$log", "navigation", "resourceCache", function($http, $log, navigation, resourceCache) {

		var SearchService = function() {
		};

		SearchService.prototype.search = function(query) {
			$http({method: "GET", url: "/api/v1/hikes/search", params: { q: query }}).
				success(function(data, status, headers, config) {
					if (data.length === 1 && data[0].relevance > .7) {
						var hike = data[0].hike;
						resourceCache.put("/api/v1/hikes/" + hike.string_id, jQuery.extend(true, {}, hike));
						navigation.toEntry(hike.string_id);
					} else {
						navigation.toSearch(query);
					}
				}).
				error(function(data, status, headers, config) {
					$log.error(data, status, headers, config);
				});
		};

		return new SearchService();
	}]);
