"use strict";

angular.module("hikeio").
	directive("clickElsewhere", ["$timeout", "$window", function($timeout, $window) {
		return {
			link: function (scope, element, attrs) {
				var documentClickHandler = function(event) {
					if (event.target === element[0]) return;
					if (attrs.ignoreClass) {
						var parents = $(event.target).parents();
						for (var i = 0; i < parents.length; i++) {
							if ($(parents[i]).hasClass(attrs.ignoreClass)) {
								return;
							}
						}
					}
					scope.$apply(attrs.clickElsewhere);
				};
				scope.$watch(attrs.isActive, function(isActive) {
					$timeout(function() {
						if (isActive) {
							$($window.document).on("click touchstart", documentClickHandler);
						} else {
							$($window.document).off("click touchstart", documentClickHandler);
						}
					});
				});
			}
		};
	}]);