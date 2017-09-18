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
		if (!appKey || !(parseInt(hour) >= 0) || !(parseInt(dow) >= 0)) {
			return false;
		}

		var criteria = {
			"app_key": appKey
		};

		var incData = {};
		incData["tod." + dow + "." + hour + ".sessions"] = 1;
		var setData = {};
		setData["app_key"] = appKey;

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
			var result = {
				"name": "Prikshit Tekta"
			};

			common.returnOutput(params, result);
			return true;
		}
		return false;
	});
}(plugin));

module.exports = plugin;