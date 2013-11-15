"use strict";

angular.module("hikeio").
	directive("contenteditable", ["$timeout", "capabilities", "filterParser", function($timeout, capabilities, filterParser) {

		return {
			require: "ngModel",
			link: function(scope, element, attributes, controller) {

				var storeViewValueInModel = function() {
					scope.$apply(function() {
						var viewValue = "";
						if (attributes.type === "text") {
							viewValue = element.text();
						} else if (attributes.type === "numeric") {
							viewValue = parseFloat(element.html()) + "";
							if (isNaN(viewValue)) {
								element.html("");
								viewValue = 0;
							} else if (viewValue !== element.html() && !element.html().match(/[0-9\.]*/)) { // Firefox adds <br>'s everywehre, this cleans them up
								element.html(viewValue);
							}
						} else {
							viewValue = element.html();
							if (element.text() === "" && viewValue !== "") {
								viewValue = "";
								element.html("");
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
					var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
					if (clipboardData) {
						var pastedData = clipboardData.getData("text/plain");
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
									if (!capabilities.contentEditableSupportsInput) {
										storeViewValueInModel();
									}
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
					var charCode = (typeof event.which === "number") ? event.which : event.keyCode;
					if (charCode === 13 && attributes.singleLine) { // Return
						event.preventDefault();
						element.blur();
						return true;
					} else if (event.metaKey || // On firefox, the meta key, delete, and arrows need to be ignored.
						charCode === 8 ||
						charCode === 0) {
						return true;
					} else if (attributes.type === "numeric" &&
						(charCode !== 46 && (charCode < 48 || charCode > 57) || // Is anything other than 0-9, a dash, or a period
						(charCode === 46 && element.text().indexOf(".") > -1))) { // Make sure if we're adding a period, we don't already have one

						if (charCode === 45 && element.text().indexOf("-") === -1  && !attributes.positive) {
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

				// Center browsers don't support input on contenteditable, in that case try to mimic the behavior here.
				if (!capabilities.contentEditableSupportsInput) {
					element.keyup(function(event) {
						var charCode = (typeof event.which === "number") ? event.which : event.keyCode;
						if (!charCode || // If charCode is undefined, this event must have been triggered by the medium editor, store the value
							(!event.ctrlKey && charCode !== 17 && // Not the control key
							!(charCode >= 37 && charCode <= 40))) { // Not the arrow keys
							storeViewValueInModel();
						}

						// TODO, refactor out of this directive
						// IE is so unreliable w.r.t. restoring the text selection, that it's better to just remove the selection with each change.
						if (!charCode) {
							if (document.selection) document.selection.empty();
							if (window.getSelection) window.getSelection().removeAllRanges();
						}
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