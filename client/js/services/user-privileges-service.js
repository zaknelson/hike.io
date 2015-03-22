"use strict";

angular.module("hikeio").
	factory("userPrivileges", ["$window", function($window) {
		var UserPrivilegesService = function() {
		};

		UserPrivilegesService.prototype.canSetHikeIsFeatured = function() {
			return $window.hikeio.userPrivileges.set_hike_is_featured;
		};

		return new UserPrivilegesService();
	}]);
