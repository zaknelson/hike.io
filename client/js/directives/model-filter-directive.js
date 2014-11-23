"use strict";

angular.module("hikeio").
	directive("modelFilter", ["$timeout", "filterParser", function($timeout, filterParser) {
		// Sets the scope variable, can take a key like "hike.distance" and resolve that to scope.hike.distance
		var setScopeVariable = function(scope, key, value) {
			var segments = key.split(".");
			var currentObject = scope;
			for (var i = 0; i < segments.length - 1; i++) {
				currentObject = currentObject[segments[i]];
			}
			currentObject[segments[segments.length - 1]] = value;
		};

		var getScopeVariable = function(scope, key) {
			var segments = key.split(".");
			var currentObject = scope;
			for (var i = 0; i < segments.length - 1; i++) {
				currentObject = currentObject[segments[i]];
			}
			return currentObject[segments[segments.length - 1]];
		};

		return {
			link: function(scope, element, attributes, controller) {
				var updatingModel = false;
				// model -> view
				var updateView = function(value) {
					if (updatingModel) return;
					var convertedValue = filterParser.filter(attributes.viewFilter, value);
					element.val(convertedValue);
				};
				scope.$watch(attributes.model, function(value) {
					updateView(value);
				});

				// view -> model
				var updateModel = function() {
					var convertedValue = parseFloat(filterParser.filter(attributes.modelFilter, element.val()));
					updatingModel = true;
					setScopeVariable(scope, attributes.model, convertedValue);
					$timeout(function() {
						updatingModel = false;
					});
					return convertedValue;
				};
				element.on("input", function() {
					scope.$apply(function() {
						updateModel();
					});
				});

				// Update when the "updateOn" variable chnges. In most cases, this is "useMetric" signifying we've changed units.
				// There are two things that can happen when the the event is triggered. Either we want to leave the current view
				// value, and update the model accordingly. Or we want to keep the current model value and update the view accordingly.
				// The "keepCurrentModelOnUpdate" variable determines this.
				scope.$watch(attributes.updateOn, function(value) {
					if (attributes.keepCurrentModelOnUpdate && getScopeVariable(scope, attributes.keepCurrentModelOnUpdate)) {
						updateView(getScopeVariable(scope, attributes.model));
					} else {
						updateModel();
					}
				});
			}
		};
	}]);