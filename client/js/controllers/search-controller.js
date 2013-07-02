"use strict";
var SearchController = function($http, $location, $log, $scope, analytics, resourceCache) {

	$scope.results = null;
	$scope.query = $location.search().q;

	if ($scope.query) {
		$http({method: "GET", url: "/api/v1/hikes/search", params: { q: $scope.query }, cache: resourceCache}).
			success(function(data, status, headers, config) {
				$scope.results = data;
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
			});
	}

	$scope.htmlReady();
};

SearchController.$inject = ["$http", "$location", "$log", "$scope", "analytics", "resourceCache"];