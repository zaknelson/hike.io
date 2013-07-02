/* https://github.com/steeve/angular-seo */
 angular.module("seo", [])
	.run(["$rootScope", function($rootScope) {
		$rootScope.htmlReady = function() {
			$rootScope.$evalAsync(function() { // fire after $digest
					setTimeout(function() { // fire after DOM rendering
						var evt = document.createEvent("Event");
						evt.initEvent("__htmlReady__", true, true);
						document.dispatchEvent(evt);
					}, 0);
			});
		};
	}]);