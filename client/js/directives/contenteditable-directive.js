"use strict";

angular.module("hikeio").
	directive("contenteditable", ["$timeout", "filterParser", function($timeout, filterParser) {

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

						if (attributes.filterModel) {
							viewValue = filterParser.filter(attributes.filterModel, viewValue);
						}

						controller.$setViewValue(viewValue);
					});

					if (attributes.change) {
						scope.$apply(attributes.change);
					}
				});

				element.on("paste", function(event) {
					if (event.originalEvent.clipboardData) {
						var pastedData = event.originalEvent.clipboardData.getData("text/plain");
						if (attributes.type === "numeric") {
							if (($.isNumeric(pastedData) && (!attributes.positive || parseFloat(pastedData) > 0)) || pastedData === ".") {
								// programmatically paste to ensure that result will be numeric
								var before = element.html();
								document.execCommand("insertText", false, pastedData);
								var after = element.html();
								if ($.isNumeric(after) && (!attributes.positive || parseFloat(after) > 0)) {
									element.trigger("change");
								} else {
									element.html(before);
									element.blur();
								}
							}
						} else {
							document.execCommand("insertText", false, pastedData);
							element.trigger("change");
						}
					}

					return false;
				});

				element.keypress(function(event) {
					var charCode = (typeof event.which == "number") ? event.which : charCode;
					if (charCode === 13 && attributes.singleLine) { // Return
						event.preventDefault();
						element.blur();
						return true;
					} else if (attributes.type === "numeric" &&
						!event.metaKey && 
						(charCode !== 8) && // Is not delete key
						(charCode !== 46 && (charCode < 48 || charCode > 57) || // Is anything other than 0-9, a dash, or a period
						(charCode === 46 && element.text().indexOf(".") > -1))) { // Make sure if we're adding a period, we don't already have one

						if (charCode === 45 && element.text().indexOf("-") === -1) {
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

					// Delay reading of attributes.filterView, otherwise it will appear to be undefined
					// http://stackoverflow.com/questions/14547425/angularjs-cant-read-dynamically-set-attributes
					$timeout(function() {
						var viewValue = controller.$viewValue;
						if (attributes.filterView) {
							viewValue = filterParser.filter(attributes.filterView, viewValue);
						}
						element.html(viewValue);

						// Workaround for issue with medium-editor
						if (viewValue && viewValue.length > 0 && element.hasClass("medium-editor-placeholder")) {
							element.removeClass("medium-editor-placeholder");
						}
					});
				};

				// Load init value from DOM
				controller.$setViewValue(element.html());
			}
		};
	}]);