;(function() {
	"use strict";

	var state = {
		edited: false
	};

	var initEditableFields = function() {
		$("[contenteditable]").on("blur keyup cut copy", function(event) {
			$(event.target).trigger("change");
		});

		$("[contenteditable]").on("paste", function(event) {
			var target = $(event.target);
			if (event.originalEvent.clipboardData) {
				var pastedData = event.originalEvent.clipboardData.getData("text/plain");
				if (target.hasClass("numeric")) {
					if (($.isNumeric(pastedData) && (!target.hasClass("positive") || parseFloat(pastedData) > 0)) || pastedData === ".") {
						// programmatically paste to ensure that result will be numeric
						var before = target.html();
						document.execCommand("insertText", false, pastedData);
						var after = target.html();
						if ($.isNumeric(after) && (!target.hasClass("positive") || parseFloat(after) > 0)) {
							target.trigger("change");
						} else {
							target.html(before);
							target.blur();
						}
					}
				} else {
					document.execCommand("insertText", false, pastedData);
					target.trigger("change");
				}
			}
			return false;
		});

		$("[contenteditable]").keypress(function(event) {
			var target = $(event.target);
			if (event.keyCode === 13 && target.hasClass("single-line")) { // return
				event.preventDefault();
				target.blur();
			} else if (target.hasClass("numeric") &&
				(event.keyCode !== 46 && (event.keyCode < 48 || event.keyCode > 57) || // is anything other than 0-9 or period
				(event.keyCode === 46 && target.text().indexOf(".") > -1))) { // make sure if we're adding a period, we don't already have one
				
				if (!target.hasClass("positive") && event.keyCode === 45) {
					var before = target.text();
					setTimeout(function(){
						if (!$.isNumeric(target.text())) {
							target.html(before);
						}
					});
					return true;
				}
				return false;
			}
		});

		$("[contenteditable]").on("input", function() {
			state.edited = true;
		});
	};

	var initHikeNameBinding = function() {
		var hikeNamedChanged = function(event) {
			if (event.target === $(".header-hike-name")[0]) {
				$(".facts-hike-name").text($(".header-hike-name").text());
			} else {
				$(".header-hike-name").text($(".facts-hike-name").text());
			}
		};

		$(".header-hike-name").change(hikeNamedChanged);
		$(".facts-hike-name").change(hikeNamedChanged);
	};

	var doSave = function() {
		/*jshint camelcase:false */

		var contentEditableUtils = new window.hikeio.ContentEditableUtils();
		var localizeUtils = new window.hikeio.LocalizeUtils();
		var mathUtils = new window.hikeio.MathUtils();

		var decimalPlaces = 10;

		var hikeJson = {};
		hikeJson.string_id = window.location.pathname.split(/\//)[1];
		hikeJson.name = $(".header-hike-name").text();
		hikeJson.locality = $(".facts-hike-location").text().trim();
		hikeJson.description = contentEditableUtils.getTextFromContentEditable($(".overview-description"));
		hikeJson.distance = mathUtils.roundTo(localizeUtils.milesToKilometers(parseFloat($(".facts-hike-distance-value").text())), decimalPlaces);
		hikeJson.elevation_gain = mathUtils.roundTo(localizeUtils.feetToMeters(parseFloat($(".facts-hike-elevation-value").text())), decimalPlaces);
		hikeJson.location = {
			latitude: mathUtils.roundTo($(".facts-hike-latitude-value").text(), decimalPlaces),
			longitude: mathUtils.roundTo($(".facts-hike-longitude-value").text(), decimalPlaces)
		};

		$(".save-button").button("loading");
		$.ajax({
			url: "/api/v1/hikes/" + hikeJson.string_id,
			type: "PUT",
			data: JSON.stringify(hikeJson),
			dataType: "json",
			success: function() {
				state.edited = false;
				$(".save-button").text("Saved");
				$(".save-button").attr("disabled");
			},
			error: function(jqXhr, textStatus, errorThrown) {
				log(jqXhr, textStatus, errorThrown);
			}
		});
	};

	var initSaveButton = function() {
		$(".save-button").click(doSave);
	};

	var initDoneButton = function() {
		$(".done-button").click(function() {
			window.location.href = window.location.href.replace(/\/edit/, "");
		});
	};

	var initFocus = function() {
		if ($(".overview-description").text().trim() === "") {
			$(".overview-description").focus();
		}
	};

	var initGlobalKeyBindings = function() {
		$(document).keydown(function(event) {
			if (event.keyCode === 8) { // delete

				// Disable delete from accidentally navigating away from the page
				var target = event.srcElement || event.target;
				if (target === document.body) {
					event.preventDefault();
				}
			} else if (event.keyCode === 83 && (event.metaKey || event.ctrlKey)) {
				doSave();
				event.preventDefault();
			}
		});
	};

	var initEditWatch = function() {
		watch(state, "edited", function() {
			if (state.edited) {
				$(".save-button").button("reset");

				// Disable annoying alert for development
				if (window.location.hostname !== "localhost") {
					window.onbeforeunload = function() {
						return "You have unsaved changes.";
					};
				}
			} else {
				$(".save-button").attr("disabled");
				window.onbeforeunload = null;
			}
		});
	};

	var initAddFileInput = function() {
		$(".add-file-input").on("change", function(e) { 
		});
	};

	$(document).ready(function() {
		if ($(".hike-page.editing").length) {
			initEditableFields();
			initHikeNameBinding();
			initAddFileInput();
			initSaveButton();
			initDoneButton();
			initFocus();
			initGlobalKeyBindings();
			initEditWatch();
		}
	});
})();