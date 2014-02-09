(function() {
	if (!String.prototype.trim) {
		String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
	}
	if (!String.prototype.endsWith) {
		String.prototype.endsWith=function(suffix){ return this.indexOf(suffix, this.length - suffix.length) !== -1; };
	}
})();