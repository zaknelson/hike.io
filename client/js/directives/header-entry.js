"use strict";

angular.module("hikeio").
	directive("headerEntry", function() {
		return {
			scope: {
				align: "@",
				label: "@",
				url: "@"
			},
			template: '<a href="{{url}}">' +
				'<div style="float:{{align}}" data-ng-click="click()" >' +
					'<div class="header-separator" data-ng-show="align == \'right\'"></div>' +
					'<div class="header-entry" data-ng-transclude>' +
						'<span class="label" data-ng-show="label">{{label}}</span>' +
					'</div>' +
					'<div class="header-separator" data-ng-show="align == \'left\'"></div>' +
				'</div>' +
			'</a>',
			transclude: true
		};
	});