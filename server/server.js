"use strict";

var io = require("socket.io").listen(8080);
var pg = require("pg");

var connectionString = process.env.DATABASE_URL || "postgres://localhost/hikeio";

var client = new pg.Client(connectionString);
client.connect();

io.set("log level", 2);

io.sockets.on("connection", function (socket) {
	socket.on("get-hikes-in-bounds", function (data) {

		// Longitude is tricky because it can jump from 179 to -179 across the international date line
		var longitudeWhereClause;
		if (data.sw.longitude < data.ne.longitude) {
			longitudeWhereClause = "(locations.longitude >= $3 AND locations.longitude <= $4)";
		} else {
			longitudeWhereClause = "(locations.longitude >= $3 OR locations.longitude <= $4)";
		}

		var queryString =  "SELECT hikes.string_id, hikes.name, locations.latitude, locations.longitude \
							FROM locations, hikes_locations, hikes \
							WHERE locations.latitude >= $1 AND \
								locations.latitude <= $2 AND " + longitudeWhereClause + " AND \
								hikes_locations.location_id = locations.id AND \
								hikes_locations.hike_id = hikes.id \
							ORDER BY locations.latitude, locations.longitude;";
		client.query(queryString, [data.sw.latitude, data.ne.latitude, data.sw.longitude, data.ne.longitude], function(err, result) {
			if (!result) {
				console.log(err);
				return;
			}
			socket.emit("get-hikes-in-bounds", result.rows);
		});
	});
});