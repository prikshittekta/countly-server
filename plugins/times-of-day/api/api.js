var plugin = {},
	common = require('../../../api/utils/common.js'),
	plugins = require('../../pluginManager.js'),
	async = require('async');

(function (plugin) {
	plugins.register("/i", function (ob) {
		var params = ob.params;

		if (!params.qstring.begin_session && !params.qstring.events) {
			return false;
		}

		var appKey = params.qstring.app_key;
		var hour = params.qstring.hour;
		var dow = params.qstring.dow;
		var events = [];

		if (!appKey ||
			!(parseInt(hour) >= 0 && parseInt(hour) <= 23) ||
			!(parseInt(dow) >= 0 && parseInt(dow) <= 6)) {
			return false;
		}

		var hasSession = false;
		var hasEvents = false;

		if (params.qstring.begin_session) {
			hasSession = true;
		}

		if (params.qstring.events && params.qstring.events.length) {
			hasEvents = true;
			events = params.qstring.events;
		}

		var queryArray = [];
		var query = {};
		var criteria = {};
		var update = {};
		var options = {};

		if (hasSession) {
			criteria = {
				"_id": "tod_" + appKey + ":Sessions"
			};

			var incData = {};
			incData[dow + "." + hour + ".count"] = 1;
			var setData = {};
			setData["_id"] = "tod_" + appKey + ":Sessions";

			update = {
				$set: setData,
				$inc: incData
			};

			options = {
				upsert: true
			};

			query = {
				"criteria": criteria,
				"update": update,
				"options": options
			};

			queryArray.push(query);
		}

		if (hasEvents) {
			for (var i = 0; i < events.length; i++) {
				criteria = {
					"_id": "tod_" + appKey + ":" + events[i].key
				};

				var incData = {};
				incData[dow + "." + hour + ".count"] = 1;
				var setData = {};
				setData["_id"] = "tod_" + appKey + ":" + events[i].key;

				update = {
					$set: setData,
					$inc: incData
				};

				options = {
					upsert: true
				};

				query = {
					"criteria": criteria,
					"update": update,
					"options": options
				};

				queryArray.push(query);
			}
		}

		var parallelTasksArray = [];

		queryArray.forEach((query) => {
			parallelTasksArray.push(insertUpdateTimesOfDay.bind(null, query));
		});

		async.parallel(parallelTasksArray, function (err, result) {
			if (err) {
				console.log("Error while updating times of day: ", err.message);
			}
		})

		function insertUpdateTimesOfDay(query, callback) {
			common.db.collection('timesofday').update(query.criteria, query.update, query.options, function (err, result) {
				if (err) {
					return callback(err);
				}
				return callback(null, result);
			});
		}

		return true;
	});

	plugins.register("/o", function (ob) {
		var params = ob.params;

		if (params.qstring.method == "times-of-day") {
			var appKey = params.qstring.app_key;
			var todType = params.qstring.tod_type;

			var criteria = {
				"_id": "tod_" + appKey + ":" + todType
			}

			common.db.collection('timesofday').find(criteria).toArray(function (err, result) {
				if (err) {
					console.log("Error while fetching times of day data: ", err.message);
					common.returnMessage(params, 400, "Something went wrong");
					return false;
				}

				result = result[0] || {};

				var timesOfDay = [];
				for (var i = 0; i < 7; i++) {
					timesOfDay[i] = [];
					for (var j = 0; j < 24; j++) {
						timesOfDay[i][j] = result[i] ?
							(result[i][j] ? result[i][j]["count"] : 0)
							: 0;
					}
				}
				common.returnOutput(params, timesOfDay);
				return true;
			})
			return true;
		}
		return false;
	});
}(plugin));

module.exports = plugin;