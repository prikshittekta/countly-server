window.todview = countlyView.extend({

    initialize: function () {

    },

    beforeRender: function () {
        if (this.template)
            return $.when(timesOfDayPlugin.initialize()).then(function () { });
        else {
            var self = this;
            return $.when(
                $.get(countlyGlobal["path"] + '/times-of-day/templates/tod.html'),
                timesOfDayPlugin.initialize()
            ).then(function (result) {
                self.template = Handlebars.compile(result[0]);
             });
        }
    },

    renderCommon: function () {
        this.templateData = {
            "page-title": "Times of day",
            "data": timesOfDayPlugin.getData()
        };

        $(this.el).html(this.template(this.templateData));
    },

    refresh: function () {
        var self = this;
        $.when(timesOfDayPlugin.initialize()).then(function () {

            if (app.activeView != self) {
                return false;
            }

            self.renderCommon();
        });
    }
});

app.todview = new todview();

app.route('/analytics/times-of-day', 'times-of-day', function () {
    this.renderWhenReady(this.todview);
});

$(document).ready(function () {
    var menu = '<a href="#/analytics/times-of-day" class="item" ">' +
        '<div class="logo fa fa-plugin" style="background-image:none; font-size:24px; text-align:center; width:35px; margin-left:14px; line-height:42px;"></div>' +
        '<div class="text" data-localize="times-of-day.plugin-title"></div>' +
        '</a>';

    $('#web-type #engagement-submenu').append(menu);
    $('#mobile-type #engagement-submenu').append(menu);
});