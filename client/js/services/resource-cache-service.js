"use strict";

angular.module("hikeio").
	factory("resourceCache", ["$cacheFactory", function($cacheFactory) {
		var cacheFactory = $cacheFactory("resourceCache");
		var superPut = cacheFactory.put;
		var superRemove = cacheFactory.remove;
		var superRemoveAll = cacheFactory.removeAll;
		var allKeys = {};
		cacheFactory.put = function(key, value) {
			allKeys[key] = value;
			superPut(key, value);
		};
		cacheFactory.remove = function(key) {
			delete allKeys[key];
			superRemove();
		};
		cacheFactory.removeAll = function() {
			allKeys = {};
			superRemoveAll();
		};
		cacheFactory.removeAllWithRoot = function(root) {
			for (var key in allKeys) {
				if (key === root || (key.substring(0, root.length) === root && key[root.length] === "?")) {
					cacheFactory.remove(key);
				}
			}
			return allKeys;
		};
		return cacheFactory;
	}]);