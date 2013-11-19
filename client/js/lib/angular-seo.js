/* https://github.com/steeve/angular-seo */
 angular.module("seo", [])
	.run(["$rootScope", "$window", function($rootScope, $window) {
		$rootScope.htmlReady = function() {
			$rootScope.$evalAsync(function() { // fire after $digest
					setTimeout(function() { // fire after DOM rendering
						if ($window.document.createEvent) {
							var evt = $window.document.createEvent("Event");
							evt.initEvent("__htmlReady__", true, true);
							$window.document.dispatchEvent(evt);
						}
					}, 0);
			});
		};
	}]);