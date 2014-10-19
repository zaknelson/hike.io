"use strict";
angular.module("hikeio").controller("SearchController",
	["$http", "$location", "$log", "$rootScope", "$scope", "analytics", "resourceCache",
	function($http, $location, $log, $rootScope, $scope, analytics, resourceCache) {

	$scope.results = null;
	$scope.query = $location.search().q;

	$rootScope.$broadcast("prepopulateAddHikeName", $scope.query);

	if ($scope.query) {
		$http({method: "GET", url: "/api/v1/hikes/search", params: { q: $scope.query, fields: "locality,name,photo_facts,string_id" }, cache: resourceCache}).
			success(function(data, status, headers, config) {
				$scope.results = data;
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
			});
	}

	$scope.htmlReady();
}]);