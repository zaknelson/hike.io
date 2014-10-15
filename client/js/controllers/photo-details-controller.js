"use strict";
angular.module("hikeio").controller("PhotoDetailsController", 
	["$rootScope", "$scope", function($rootScope, $scope) {
	
	$scope.isLoaded = false;

	$scope.$on("setPhotoDetailsPhoto", function(event, photo) {
		$scope.photo = jQuery.extend({}, photo);
		$scope.originalPhoto = photo;
		$scope.isLoaded = true;
	});

	$scope.update = function() {
		$scope.originalPhoto.attribution_link = $scope.photo.attribution_link;
		$scope.originalPhoto.alt = $scope.photo.alt;
		$rootScope.$broadcast("photoDetailsUpdated", $scope.originalPhoto);
		$.fancybox.close();
	};
}]);