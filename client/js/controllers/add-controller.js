"use strict";
var AddController = function($http, $log, $scope, navigation) {
	$scope.hike = {};
	$scope.hike.location = {};

	$scope.add = function() {
		$http({method: "POST", url: "/api/v1/hikes", data: $scope.hike}).
			success(function(data, status, headers, config) {
				navigation.toEntry(data.string_id);
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
			}
		);
	};
};

AddController.$inject = ["$http", "$log", "$scope", "navigation"];