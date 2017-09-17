var plugin = {},
	common = require('../../../api/utils/common.js'),
	plugins = require('../../pluginManager.js');

(function (plugin) {
	plugins.register("/i", function (ob) {
		var params = ob.params;

		return true;
	});

	plugins.register("/o", function(ob){
		var params = ob.params;

		if(params.qstring.method == "times-of-day"){
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