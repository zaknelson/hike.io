"use strict";
var AppController = function($scope, $window) {
	$scope.isSearchBoxActive = false;

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
			if (target === $window.document.body) {
				event.preventDefault();
			}
		} else if (event.keyCode === 83 && (event.metaKey || event.ctrlKey)) { // save event
			$scope.$broadcast("keyboardEventSave");
			event.preventDefault();
		}
	};
};

AppController.$inject = ["$scope", "$window"];