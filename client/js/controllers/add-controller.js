"use strict";
var AddController = function($http, $log, $scope, navigation, resourceCache) {
	$scope.hike = {};
	$scope.hike.location = {};

	$scope.add = function() {
		$http({method: "POST", url: "/api/v1/hikes", data: $scope.hike}).
			success(function(data, status, headers, config) {
				if (status === 202) {
					// Keep this temporary version in the user's session cache, in case they decide to make other changes.
					resourceCache.put("/api/v1/hikes/" + $scope.hike.string_id, jQuery.extend(true, {}, $scope.hike));
				}
				navigation.toEntry(data.string_id);
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
			}
		);
	};
	$scope.htmlReady();
};

AddController.$inject = ["$http", "$log", "$scope", "navigation", "resourceCache"];