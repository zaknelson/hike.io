"use strict";
var PhotoDetailsController = function($rootScope, $scope) {

	$scope.$on("setPhotoDetailsPhoto", function(event, photo) {
		$scope.photo = jQuery.extend({}, photo);
		$scope.originalPhoto = photo;
	});
	$scope.$on("fancyboxLoaded", function() {
		$scope.$apply(function() {
			$scope.isLoaded = true;
		});
	});

	$scope.update = function() {
		$scope.originalPhoto.attribution_link = $scope.photo.attribution_link;
		$scope.originalPhoto.alt = $scope.photo.alt;
		$rootScope.$broadcast("photoDetailsUpdated");
		$.fancybox.close();
	};
};

PhotoDetailsController.$inject = ["$rootScope", "$scope"];