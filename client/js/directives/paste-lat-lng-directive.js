"use strict";

angular.module("hikeio").
	directive("pasteLatLng", ["$timeout", "$window", function($timeout, $window) {
		return {
			require: "ngModel",
			link: function(scope, element, attributes) {
				element.on("paste", function(event) {
					var clipboardData = event.originalEvent.clipboardData || $window.clipboardData;
					if (clipboardData) {
						var pastedData = clipboardData.getData("text/plain");
						if (pastedData.match(/-?\d+\.\d+,-?\d+\.\d+/)) {
							var a = pastedData.split(",");
							var lat = parseFloat(a[0]);
							var lng = parseFloat(a[1]);
							var parent = element.parent();
							scope.$apply(parent.find("[data-paste-lat-lng=lat]").attr("data-ng-model") + "=" + lat);
							scope.$apply(parent.find("[data-paste-lat-lng=lng]").attr("data-ng-model") + "=" + lng);
							parent.find("[data-paste-lat-lng=lat]").val(lat).change();
							parent.find("[data-paste-lat-lng=lng]").val(lng).change();
							$window.document.activeElement.blur();
						}
					}
				});
			}
		};
	}]);