"use strict";

angular.module("hikeio").
	directive("contenteditable", ["$timeout", "$window", "capabilities", "filterParser", "selection", function($timeout, $window, capabilities, filterParser, selection) {

		return {
			require: "ngModel",
			link: function(scope, element, attributes, controller) {

				var isValidNumericInput = function(str) {
					return (!attributes.positive && str === "-") || ($.isNumeric(str) && (!attributes.positive || parseFloat(str) >= 0));
				};

				var setElementHtml = function(html) {
					element.html(html);
					if (!capabilities.contentEditableSupportsInput) {
						storeViewValueInModel();
					}
				};

				var storeViewValueInModel = function() {
					scope.$apply(function() {
						var viewValue = "";
						if (attributes.type === "text") {
							viewValue = element.text();
						} else if (attributes.type === "numeric") {
							viewValue = element.text();
							if (viewValue !== element.html()) {
								element.html(viewValue);
							}
							if (!isValidNumericInput(viewValue)) {
								return;
							}
						} else {
							viewValue = element.html();
							if (element.text() === "" && viewValue !== "") { // Cleanup hidden characters
								viewValue = "";
								setElementHtml("");
							}
						}

						if (attributes.filterModel) {
							viewValue = filterParser.filter(attributes.filterModel, viewValue);
						}

						controller.$setViewValue(viewValue);
					});

					if (attributes.change) {
						scope.$apply(attributes.change);
					}
				};

				// view -> model
				element.on("input", function() {
					storeViewValueInModel();
				});

				element.on("paste", function(event) {
					var clipboardData = event.originalEvent.clipboardData || $window.clipboardData;
					if (clipboardData && clipboardData.types) {
						var pastedData = clipboardData.getData("text/plain");
						if (attributes.type === "numeric") {
							// Programmatically paste to ensure that result will be numeric
							var before = element.html();
							$window.document.execCommand("insertText", false, pastedData);
							var after = element.html();
							if (isValidNumericInput(after)) {
								storeViewValueInModel();
							} else {
								setElementHtml(before);
								element.blur();
							}
						} else {
							$window.document.execCommand("insertText", false, pastedData);
							storeViewValueInModel();
						}
						return false;
					} else {
						$timeout(function() {
							storeViewValueInModel();
						});
						return true;
					}
				});

				element.keypress(function(event) {
					var charCode = event.which;
					if (charCode === 13 && attributes.singleLine) { // Return
						event.preventDefault();
						element.blur();
						return true;
					} else if (event.metaKey || // On firefox, the meta key, delete, and arrows need to be ignored.
						charCode === 8 ||
						charCode === 0) {
						return true;
					} else if (attributes.type === "numeric") {
						var before = element.text();
						setTimeout(function(){
							var after = element.text();
							if (!isValidNumericInput(after)) {
								setElementHtml(before);
							}
						});
					}
					return true;
				});

				// Center browsers don't support input on contenteditable, in that case try to mimic the behavior here.
				if (!capabilities.contentEditableSupportsInput) {
					element.keyup(function(event) {
						var charCode = event.which;
						if (!charCode || // If charCode is undefined, this event must have been triggered by the medium editor, store the value
							charCode === 8 ||
							(!event.ctrlKey && charCode !== 17 && // Not the control key
							!(charCode >= 37 && charCode <= 40))) { // Not the arrow keys
							storeViewValueInModel();
						}

						// TODO, refactor out of this directive
						// IE is so unreliable w.r.t. restoring the text selection, that it's better to just remove the selection with each change.
						if (!charCode) {
							selection.clear();
						}
					});
					element.on("cut", function() {
						$timeout(function() {
							storeViewValueInModel();
						});
					});
				}

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