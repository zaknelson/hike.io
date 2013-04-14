"use strict";

angular.module("hikeio").
	directive("contenteditable", function() {
	return {
		require: "ngModel",
		link: function(scope, element, attributes, controller) {

			// view -> model
			element.on("input", function() {
				scope.$apply(function() {
					var viewValue = "";
					if (attributes.type === "text") {
						viewValue = element.text();
					} else {
						viewValue = element.html();
					}
					controller.$setViewValue(viewValue);
				});
			});

			element.on("paste", function(event) {
				if (event.originalEvent.clipboardData) {
					var pastedData = event.originalEvent.clipboardData.getData("text/plain");
					document.execCommand("insertText", false, pastedData);
					element.trigger("change");
				}
				return false;
			});

		element.keypress(function(event) {
			if (event.keyCode === 13 && attributes.singleLine) { // return
				event.preventDefault();
				element.blur();
			} else if (attributes.type === "numeric" &&
				(event.keyCode !== 46 && (event.keyCode < 48 || event.keyCode > 57) || // is anything other than 0-9 or period
				(event.keyCode === 46 && element.text().indexOf(".") > -1))) { // make sure if we're adding a period, we don't already have one
				
				if (attributes.positive && event.keyCode === 45) {
					var before = element.text();
					setTimeout(function(){
						if (!$.isNumeric(element.text())) {
							element.html(before);
						}
					});
					return true;
				}
				return false;
			}
			return true;
		});

		// model -> view
		controller.$render = function() {
			element.html(controller.$viewValue);
		};

		// Load init value from DOM
		controller.$setViewValue(element.html());
		}
	};
});