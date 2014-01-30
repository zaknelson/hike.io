"use strict";
var PhotoStreamController = function($scope, $http, $log, $timeout, analytics, resourceCache) {

	$http({method: "GET", url: "/api/v1/hikes?fields=distance,locality,name,photo_facts,photo_landscape,photo_preview,string_id", cache: resourceCache}).
		success(function(data, status, headers, config) {
			var hikes = jQuery.grep(data, function(hike) {
				// Quick and dirty way of checking whether the entry is good enough to show on the /discover page,
				// Maybe want them to go through a curation process some day.
				return hike.photo_landscape && hike.photo_facts;
			});
			$scope.hikes = hikes;
		}).
		error(function(data, status, headers, config) {
			$log.error(config);
		});

	$scope.hikes = [];
	$scope.htmlReady();
};

PhotoStreamController.$inject = ["$scope", "$http", "$log", "$timeout", "analytics", "resourceCache"];