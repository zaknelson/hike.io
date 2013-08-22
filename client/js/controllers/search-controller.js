"use strict";
var SearchController = function($http, $location, $log, $scope, analytics, progressbar, resourceCache) {

	$scope.results = null;
	$scope.query = $location.search().q;

	progressbar.start();
	if ($scope.query) {
		$http({method: "GET", url: "/api/v1/hikes/search", params: { q: $scope.query }, cache: resourceCache}).
			success(function(data, status, headers, config) {
				$scope.results = data;
				progressbar.complete();
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
				progressbar.complete();
			});
	}

	$scope.htmlReady();
};

SearchController.$inject = ["$http", "$location", "$log", "$scope", "analytics", "progressbar", "resourceCache"];