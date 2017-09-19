var plugin = {},
	common = require('../../../api/utils/common.js'),
	plugins = require('../../pluginManager.js');

(function (plugin) {
	plugins.register("/i", function (ob) {
		var params = ob.params;

		if (!params.qstring.begin_session || !params.qstring.events) {
			return false;
		}

		var appKey = params.qstring.app_key;
		var hour = params.qstring.hour;
		var dow = params.qstring.dow;

		if (!appKey ||
			!(parseInt(hour) >= 0 && parseInt(hour) <= 23) ||
			!(parseInt(dow) >= 0 && parseInt(dow) <= 6)) {
			return false;
		}

		var criteria = {
			"_id": "tod_Sessions:" + appKey
		};

		var incData = {};
		incData[dow + "." + hour + ".count"] = 1;
		var setData = {};
		setData["_id"] = "tod_Sessions:" + appKey;

		var update = {
			$set: setData,
			$inc: incData
		};

		var options = {
			upsert: true
		};

		common.db.collection('timesofday').update(criteria, update, options, function (err, result) {
			if (err) {
				console.log("Error while updating times of day: ", err.message);
			}
		});

		return true;
	});

	plugins.register("/o", function (ob) {
		var params = ob.params;

		if (params.qstring.method == "times-of-day") {
			var appKey = params.qstring.app_key;
			var todType = params.qstring.tod_type;

			var criteria = {
				"_id": "tod_"+ todType + ":" + appKey
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