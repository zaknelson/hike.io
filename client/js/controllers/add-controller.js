"use strict";
var AddController = function($http, $log, $scope, navigation, progressbar) {
	$scope.hike = {};
	$scope.hike.location = {};

	progressbar.start();
	$scope.add = function() {
		progressbar.start();
		$http({method: "POST", url: "/api/v1/hikes", data: $scope.hike}).
			success(function(data, status, headers, config) {
				navigation.toEntry(data.string_id);
				progressbar.complete();
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
				progressbar.complete();
			}
		);
	};
	$scope.htmlReady();
	progressbar.complete();
};

AddController.$inject = ["$http", "$log", "$scope", "navigation", "progressbar"];