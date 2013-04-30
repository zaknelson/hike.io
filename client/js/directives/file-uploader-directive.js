"use strict";

angular.module("hikeio").
	directive("fileUploader", function() {
	return {
		compile: function(tplElm, tplAttr) {
			tplElm.after("<input type='file' style='display: none;'>");

			return function(scope, elm, attr) {
				if (scope.$eval(attr.enabled)) {
					var input = angular.element(elm[0].nextSibling);

					input.bind("change", function() {
						if (input[0].files.length > 0) {
							scope.$eval(attr.fileUploader, {file: input[0].files[0]});
						}
					});

					elm.bind("click", function() {
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
});