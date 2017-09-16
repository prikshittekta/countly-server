(function (countlyOurplugin, $) {

    var _data = {};

    countlyOurplugin.initialize = function () {

        // returning promise
        _data = {
            name: "PTS"
        };
        // return $.ajax({
        //     type: "GET",
        //     url: "/o",
        //     data: {
        //         "api_key": countlyGlobal.member.api_key,
        //         "app_id": countlyCommon.ACTIVE_APP_ID,
        //         "method": "times-of-day"
        //     },
        //     success: function (json) {
        //         _data = json;
        //     }
        // });
        return;
    };

    //return data that we have
    countlyOurplugin.getData = function () {
        return _data;
    };

}(window.countlyOurplugin = window.countlyOurplugin || {}, jQuery));