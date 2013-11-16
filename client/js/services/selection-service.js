"use strict";

angular.module("hikeio").
	factory("selection", ["$document", "$window", function($document, $window) {

		var SelectionService = function() {
		};

		SelectionService.prototype.clear = function(query) {
			if ($window.getSelection) {
				if ($window.getSelection().empty) {
					$window.getSelection().empty();
				} else if ($window.getSelection().removeAllRanges) {
					$window.getSelection().removeAllRanges();
				}
			} else if ($document.selection) {
				$document.selection.empty();
			}
		};

		return new SelectionService();
	}]);
