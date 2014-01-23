"use strict";

angular.module("hikeio").
	factory("search", ["$http", "$log", "$q", "$rootScope", "navigation", "persistentStorage", "resourceCache", function($http, $log, $q, $rootScope, navigation, persistentStorage, resourceCache) {

		var SearchService = function() {
		};

		var getBestGeocodeResult = function(data) {
			// Loop over results until we find a city, state, province, country, etc.
			// results sholud be ordered by relevance
			if (data.status === "OK" && data.results && data.results.length > 0) {
				var results = data.results;
				for (var i = 0; i < results.length; i++) {
					var result = results[i];
					var types = result.types;
					for (var j = 0; j < types.length; j++) {
						// https://developers.google.com/maps/documentation/geocoding/#Types
						var type = types[j];
						if (type === "political" ||
							type === "country" ||
							type === "administrative_area_level_1" ||
							type === "administrative_area_level_2" ||
							type === "administrative_area_level_3" ||
							type === "locality" ||
							type === "sublocality" ||
							type === "sublocality_level_1" ||
							type === "postal_code" ||
							type === "park" ||
							type === "natural_feature") {
							return result;
						}
					}
				}
			}
		};

		var getMapViewportFromGeocodeResult = function(result) {
			var viewport = result.geometry.viewport;
			return {
				northEast: {
					latitude: viewport.northeast.lat,
					longitude: viewport.northeast.lng
				},
				southWest: {
					latitude: viewport.southwest.lat,
					longitude: viewport.southwest.lng
				}
			};
		};

		var cleanupFormattedAddress = function(address) {
			// Remove zip code
			var result = address.replace(/ \d{5}/, "");

			// Remove USA, unless there is another locality in the string. We want it to say Washington, USA. But not Seattle, WA, USA.
			if (result.split(",").length !== 2) {
				result = result.replace(/, USA/, "");
			}
			return result;
		};

		var searchByLocation = function(query) {
			// This request should be automatically biased based on where the request is coming from
			return $http({method: "GET", url: "http://maps.googleapis.com/maps/api/geocode/json", params: { address: query, sensor: false }, cache: resourceCache}).
				success(function(data) {
					// First make sure that what we got back is actually useful, we don't want to bring up the map to a specific address.
					var result = getBestGeocodeResult(data);
					if (result) {
						var viewport = getMapViewportFromGeocodeResult(result);
						persistentStorage.set("/map", { viewport: viewport, formattedLocationString: cleanupFormattedAddress(result.formatted_address)});
						if (navigation.onMap()) {
							$rootScope.$broadcast("resetMapViewport", viewport);
						} else {
							navigation.toMap();
						}
					}
				}).error(function(data, status, headers, config) {
					$log.error(data, status, headers, config);
				});
		};

		var searchByName = function(query) {
			return $http({method: "GET", url: "/api/v1/hikes/search", params: { q: query }, cache: resourceCache}).
				success(function(data, status, headers, config) {
					var relevanceThreshold = 0.7;
					if (data.length === 1 && data[0].relevance > relevanceThreshold) {
						var hike = data[0].hike;
						resourceCache.put("/api/v1/hikes/" + hike.string_id, jQuery.extend(true, {}, hike));
						navigation.toEntry(hike.string_id);
					} else {
						// If any of the results are of high enough relevance, then we want to see those results first
						// If they're low quality matches, try searching by location.
						for (var i = 0; i < data.length) {
							var result = data[i];
							if (data.relevance > relevanceThreshold) {
								navigation.toSearch(query);
								break;
							}
						}
					}
				}).
				error(function(data, status, headers, config) {
					$log.error(data, status, headers, config);
				});
		};

		SearchService.prototype.search = function(query) {
			var deferred = $q.defer();
			var promise = deferred.promise;

			// Secret feature, allow user to force searching by location if they prepend their query with a !
			if (query[0] === "!") {
				searchByLocation(query.slice(1)).then(function() {
					deferred.resolve();
				});
				return promise;
			}

			// Otherwise, first check to see if there is a hike with this name
			searchByName(query).then(function(result) {
				if (result.data.length !== 0) {
					// Unable to find good match name, try by location
					searchByLocation(query).then(function(result) {
						if (!getBestGeocodeResult(result.data)) {
							navigation.toSearch(query);
						}
						deferred.resolve();
					});
				} else {
					deferred.resolve();
				}
			});
			return promise;
		};

		return new SearchService();
	}]);
