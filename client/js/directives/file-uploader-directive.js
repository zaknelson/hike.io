"use strict";

angular.module("hikeio").
	directive("fileUploader", ["$window", function($window) {
	return {
		compile: function(tplElm, tplAttr) {
			var mulitpleStr = tplAttr.multiple === "true" ? "multiple" : "";
			var acceptStr = tplAttr.accept ? " accept='" + tplAttr.accept + "'" : "";
			if (tplAttr.description) {
				var fontSize = tplAttr.descriptionFontSize || "14";
				tplElm.append("<div style='position:absolute; top:50%; text-align:center; line-height:100px; pointer-events:none; width:100%; height:100px; margin-top:-50px; font-style:italic; color: #999; font-size: " + fontSize + "px;'>" + tplAttr.description + "</div>");
			}
			tplElm.after("<input type='file' " + mulitpleStr + acceptStr + " style='display: none;'>");
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
					elm.css("position", "relative");
				}
			};
		},
		replace: true,
		template: "<div data-ng-transclude></div>",
		transclude: true
	};
}]);