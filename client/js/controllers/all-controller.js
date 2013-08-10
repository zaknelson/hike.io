"use strict";
var AllController = function($scope, $http, $log, analytics, resourceCache) {
	$http({method: "GET", url: "/api/v1/hikes?fields=locality,name,string_id", cache: resourceCache}).
		success(function(data, status, headers, config) {
			var localityMap = {};
			var localities = [];
			for (var i  = 0; i < data.length; i++) {
				var hike = data[i];
				var locality = localityMap[hike.locality];
				if (!locality) {
					locality = { name: hike.locality, hikes: [] };
					localities.push(locality);
					localityMap[locality.name] = locality;
				}
				locality.hikes.push(hike);
			}
			$scope.localities = localities;
		}).
		error(function(data, status, headers, config) {
			$log.error(config);
		});

	$scope.localities = [];
	$scope.htmlReady();
};

AllController.$inject = ["$scope", "$http", "$log", "analytics", "resourceCache"];