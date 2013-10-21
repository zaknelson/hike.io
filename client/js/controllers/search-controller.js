"use strict";
var SearchController = function($http, $location, $log, $rootScope, $scope, analytics, resourceCache) {

	$scope.results = null;
	$scope.query = $location.search().q;

	$rootScope.$broadcast("prepopulateAddHikeName", $scope.query);

	if ($scope.query) {
		$http({method: "GET", url: "/api/v1/hikes/search", params: { q: $scope.query }}).
			success(function(data, status, headers, config) {
				$scope.results = data;
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
			});
	}

	$scope.htmlReady();
};

SearchController.$inject = ["$http", "$location", "$log", "$rootScope", "$scope", "analytics", "resourceCache"];