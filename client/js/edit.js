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

		$("h1,td[contenteditable]").keypress(function(event) {
			if (event.keyCode === 13) { // return
				event.preventDefault();
				$(event.target).blur();
			} else {
				setEdited(true);
			}
		});
	};

	var initEntryNameBinding = function() {
		var entryNamedChanged = function(event) {
			if (event.target === $(".header-entry-name")[0]) {
				$(".facts-entry-name").text($(".header-entry-name").text());
			} else {
				$(".header-entry-name").text($(".facts-entry-name").text());
			}
		};

		$(".header-entry-name").change(entryNamedChanged);
		$(".facts-entry-name").change(entryNamedChanged);
	};

	var initSaveButton = function() {
		$(".save-button").click(function() {
			/*jshint camelcase:false */
			var utils = new window.io.hike.ContentEditableUtils();

			var entryJson = {};
			entryJson.string_id = window.location.pathname.split(/\//)[1];
			entryJson.name = $(".header-entry-name").text();
			entryJson.description = utils.getTextFromContentEditable($(".overview-description"));
			//entryJson.distance
			//entryJson.elevation_gain
			console.log(entryJson);
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
		if ($(".entry-page.editing").length) {
			initEditableFields();
			initEntryNameBinding();
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