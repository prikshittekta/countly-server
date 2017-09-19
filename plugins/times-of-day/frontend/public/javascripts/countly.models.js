(function (timesOfDayPlugin, $) {

    var _todData = {};
    var _eventsList = {};

    timesOfDayPlugin.initialize = function () {
        
    };

    timesOfDayPlugin.fetchTodData = function (todType) {
        return $.ajax({
            type: "GET",
            url: countlyCommon.API_URL + "/o",
            data: {
                "api_key": countlyGlobal.member.api_key,
                "app_key": countlyCommon.ACTIVE_APP_KEY,
                "app_id": countlyCommon.ACTIVE_APP_ID,
                "tod_type": todType,
                "method": "times-of-day"
            },
            success: function (json) {
                _todData = json;
            }
        });
    };

    timesOfDayPlugin.fetchAllEvents = function () {
        return $.ajax({
            type: "GET",
            url: countlyCommon.API_URL + "/o",
            data: {
                "api_key": countlyGlobal.member.api_key,
                "app_id": countlyCommon.ACTIVE_APP_ID,
                "method": "get_events"
            },
            success: function (json) {
                _eventsList = json || {};
            }
        });
    }

    timesOfDayPlugin.getTodData = function () {
        return _todData;
    };

    timesOfDayPlugin.getEventsList = function () {
        return _eventsList;
    };

}(window.timesOfDayPlugin = window.timesOfDayPlugin || {}, jQuery));