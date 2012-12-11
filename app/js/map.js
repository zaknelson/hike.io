(function() {

	var initMap = function() {		
		var locations = [new google.maps.LatLng(48.18896, -116.081362),
						 new google.maps.LatLng(55.94300, -3.161),
						 new google.maps.LatLng(-3.066465, 37.350666),
						 new google.maps.LatLng(38.8406, -105.0442)]

		var bounds = new google.maps.LatLngBounds(locations[0], locations[0]);

		var mapOptions = {
			zoom: 4,
			center: locations[0],
			mapTypeId: google.maps.MapTypeId.TERRAIN
		}
		var map = new google.maps.Map($(".map-page")[0], mapOptions);

		for (var i = 0; i < locations.length; i++) {
			bounds.extend(locations[i]);
			var marker = new google.maps.Marker({
				position: locations[i],
				map: map
			});
		}
		map.fitBounds(bounds);
	};
	$(document).ready(function() {
		if ($(".map-page").length) {
			initMap();
		}
	});
}
)();