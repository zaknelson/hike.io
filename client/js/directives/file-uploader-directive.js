"use strict";

angular.module("hikeio").
	directive("fileUploader", ["$window", function($window) {
	return {
		compile: function(tplElm, tplAttr) {
			var mulitpleStr = tplAttr.multiple === "true" ? "multiple" : "";
			tplElm.after("<input type='file' " + mulitpleStr + " accept='image/png, image/jpeg' style='display: none;'>");

			return function(scope, elm, attr) {
				if (scope.$eval(attr.enabled)) {
					var input = angular.element(elm[0].nextSibling);

					input.bind("change", function() {
						if (input[0].files.length > 0) {
							scope.$eval(attr.fileUploader, {files: input[0].files});
							input[0].value = ""; // Allow the user to select the same file again
						}
					});

					elm.bind("click", function() {
						if (input[0].disabled || !$window.FileReader || !window.FormData) {
							$window.alert("Sorry, you cannot upload photos from this browser.");
							return;
						}
						input[0].click();
					});

					elm.css("cursor", "pointer");
				}
			};
		},
		replace: true,
		template: "<div data-ng-transclude></div>",
		transclude: true
	};
}]);