"use strict";
var AppController = function($scope) {
	$scope.isSearchBoxActive = false;
	$scope.isAdmin = window.hikeio.isAdmin;

	$scope.hideSearchBox = function() {
		$scope.isSearchBoxActive = false;
	};

	$scope.toggleSearchBox = function() {
		$scope.isSearchBoxActive = !$scope.isSearchBoxActive;
	};

	$scope.handleGlobalKeydown = function(event) {
		if (event.keyCode === 8) { // delete
			// Disable delete from accidentally navigating away from the page
			var target = event.srcElement || event.target;
			if (target === document.body) {
				event.preventDefault();
			}
		} else if ($scope.isAdmin && event.keyCode === 83 && (event.metaKey || event.ctrlKey)) { // save event
			$scope.$broadcast("keyboardEventSave");
			event.preventDefault();
		}
	};
};

AppController.$inject = ["$scope"];