"use strict";

angular.module("hikeio").
	directive("contenteditable", ["$filter", "$timeout", function($filter, $timeout) {

		var runFilter = function(filterString, value) {
			var filterParams = filterString.split(":");
			var filterName = filterParams.splice(0, 1);
			filterParams.splice(0, 0, value);
			return $filter(filterName).apply(this, filterParams);
		};

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
							viewValue = runFilter(attributes.filterModel, viewValue);
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

					// Delay reading of attributes.filterView, otherwise it will appear to be undefined
					// http://stackoverflow.com/questions/14547425/angularjs-cant-read-dynamically-set-attributes
					$timeout(function() {
						var viewValue = controller.$viewValue;
						if (attributes.filterView) {
							viewValue = runFilter(attributes.filterView, viewValue);
						}
						element.html(viewValue);
					});
				};

				// Load init value from DOM
				controller.$setViewValue(element.html());
			}
		};
	}]);