(function() {
	"use strict";

	var edited;
	var savedSinceLastEdit;

	var initEditableFields = function() {
		$("[contenteditable]").on("blur keyup paste", function(event) {
			var target = $(this);
			if (event.type === "paste") {
				var pasteData = event.originalEvent.clipboardData.getData("text/plain");
				var utils = new window.io.hike.ContentEditableUtils();
				utils.replaceSelectedText(pasteData);
				event.preventDefault();
			}
			if (target.data("before") !== target.html()) {
				target.data("before", target.html());
				target.trigger("change");
			}
		});

		$(".single-line[contenteditable]").keypress(function(event) {
			if (event.keyCode === 13) { // return
				event.preventDefault();
				$(event.target).blur();
			} else {
				setEdited(true);
			}
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

	var initSaveButton = function() {
		$(".save-button").click(function() {
			/*jshint camelcase:false */
			var utils = new window.hikeio.ContentEditableUtils();

			var hikeJson = {};
			hikeJson.string_id = window.location.pathname.split(/\//)[1];
			hikeJson.name = $(".header-hike-name").text();
			hikeJson.description = utils.getTextFromContentEditable($(".overview-description"));
			//hikeJson.distance
			//hikeJson.elevation_gain
			$.ajax({
				url: "/api/v1/hikes/" + hikeJson.string_id,
				type: "PUT",
				data: JSON.stringify(hikeJson),
				dataType: "json",
				success: function() {
					window.location.href = window.location.href.replace(/\/edit/, "");
				}
			});
			console.log(hikeJson);
		});
	};

	var initCancelButton = function() {
		$(".cancel-button").click(function() {
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
			}
		});
	};

	var setEdited = function(isEdited) {
		edited = isEdited;
		if (isEdited) {
			setSavedSinceLastEdit(false);
			//window.onbeforeunload = function(event) {
			//	return "You have unsaved changes.";
		} else {
			window.onbeforeunload = null;
		}
	};

	var setSavedSinceLastEdit = function(isSavedSinceLastEdit) {
		savedSinceLastEdit = isSavedSinceLastEdit;
	};

	$(document).ready(function() {
		if ($(".hike-page.editing").length) {
			initEditableFields();
			initHikeNameBinding();
			initSaveButton();
			initCancelButton();
			initFocus();
			initGlobalKeyBindings();
			setEdited(false);
			setSavedSinceLastEdit(true);
		}
	});
}
)();