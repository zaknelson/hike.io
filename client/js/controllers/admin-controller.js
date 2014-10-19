"use strict";
angular.module("hikeio").controller("AdminController", 
	["$http", "$scope", function($http, $scope) {
	
	$scope.reviews = [];
	$http({method: "GET", url: "/admin/v1/reviews?status=unreviewed"}).
		success(function(data, status, headers, config) {
			$scope.reviews = data;
		});

	$scope.accept = function(review) {
		$http({method: "GET", url: "/admin/v1/reviews/" + review.string_id + "/accept"}).
			success(function(data, status, headers, config) {
				$scope.reviews.splice($scope.reviews.indexOf(review), 1);
			});
	};

	$scope.reject = function(review) {
		$http({method: "GET", url: "/admin/v1/reviews/" + review.string_id + "/reject"}).
			success(function(data, status, headers, config) {
				$scope.reviews.splice($scope.reviews.indexOf(review), 1);
			});
	};
}]);