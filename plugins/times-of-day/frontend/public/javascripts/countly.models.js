(function (timesOfDayPlugin, $) {

    var _data = {};

    timesOfDayPlugin.initialize = function () {
        return $.ajax({
            type: "GET",
            url: countlyCommon.API_URL + "/o",
            data: {
                "api_key": countlyGlobal.member.api_key,
                "app_key": countlyCommon.ACTIVE_APP_KEY,
                "app_id": countlyCommon.ACTIVE_APP_ID,
                "method": "times-of-day"
            },
            success: function (json) {
                _data = json;
            }
        });
    };

    timesOfDayPlugin.getData = function () {
        return _data;
    };

}(window.timesOfDayPlugin = window.timesOfDayPlugin || {}, jQuery));