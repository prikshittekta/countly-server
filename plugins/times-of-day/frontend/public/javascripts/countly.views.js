window.todview = countlyView.extend({

    initialize: function () {

    },

    beforeRender: function () {
        var self = this;
        self.tod_type = "Sessions";
        return $.when(
            $.get(countlyGlobal["path"] + '/times-of-day/templates/tod.html'),
            timesOfDayPlugin.fetchTodData(self.tod_type),
            timesOfDayPlugin.fetchAllEvents()
        ).done(function (result) {
            self.template = Handlebars.compile(result[0]);
            self.timesOfDayData = timesOfDayPlugin.getTodData();
            self.eventsList = timesOfDayPlugin.getEventsList();
        });
    },

    loadSessionEventData: function () {
        $("#event-session-list").html('<div data-value="Sessions" class="es-option item" data-localize="times-of-day.sessions">' + jQuery.i18n.map['times-of-day.sessions'] + '</div>');

        var events = this.eventsList.list || [];
        for (var i = 0; i < events.length; i++) {
            $("#event-session-list").append('<div data-value="' + events[i] + '" class="es-option item" data-localize="">' + events[i] + '</div>');
        }

        var self = this;
        $(".es-option").on("click", function () {
            var value = $(this).data("value");
            self.tod_type = value;
            $.when(
                timesOfDayPlugin.fetchTodData(value),
                timesOfDayPlugin.fetchAllEvents()
            ).done(function (result) {
                self.timesOfDayData = timesOfDayPlugin.getTodData();
                self.eventsList = timesOfDayPlugin.getEventsList();
                self.updateView();
            });
        });
    },

    renderCommon: function () {
        this.templateData = {
            "page-title": jQuery.i18n.map["times-of-day.plugin-title"]
        };

        $(this.el).html(this.template(this.templateData));

        this.updateView();
    },

    updateView: function () {
        $('#chart').empty();        
        this.loadSessionEventData();
        this.loadTimesOfDay();
    },

    loadTimesOfDay: function () {
        var margin = { top: 40, right: 10, bottom: 10, left: 20 }
        var width = 960 - margin.left - margin.right
        var height = 390 - margin.top - margin.bottom
        var padding = 3
        var xLabelHeight = 30
        var yLabelWidth = 80
        var borderWidth = 3
        var duration = 0

        var chart = d3.select('#chart').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        var border = chart.append('rect')
            .attr('x', yLabelWidth)
            .attr('y', xLabelHeight)
            .style('fill-opacity', 0)
            .style('stroke', '#666')
            .style('stroke-width', borderWidth)
            .style('shape-rendering', 'crispEdges')

        loadPunchCard(this.timesOfDayData);

        function loadPunchCard(punchCardData) {

            var labelsX = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
            var labelMapping = {
                "0": "Sunday",
                "1": "Monday",
                "2": "Tuesday",
                "3": "Wednesday",
                "4": "Thursday",
                "5": "Friday",
                "6": "Saturday"
            };

            var data = [];

            for (var i = 0; i < punchCardData.length; i++) {
                data.push({
                    label: labelMapping[i],
                    values: punchCardData[i]
                })
            }

            update(data, labelsX);
        }

        function update(data, labelsX) {

            var allValues = Array.prototype.concat.apply([], data.map(function (d) { return d.values }))
            var maxWidth = d3.max(data.map(function (d) { return d.values.length }))
            var maxR = d3.min([(width - yLabelWidth) / maxWidth, (height - xLabelHeight) / data.length]) / 2

            var r = function (d) {
                if (d === 0) return 0

                f = d3.scale.sqrt()
                    .domain([d3.min(allValues), d3.max(allValues)])
                    .rangeRound([2, maxR - padding])

                return f(d)
            }

            var c = d3.scale.linear()
                .domain([d3.min(allValues), d3.max(allValues)])
                .rangeRound([255 * 0.8, 0])

            var rows = chart.selectAll('.row')
                .data(data, function (d) { return d.label })

            rows.enter().append('g')
                .attr('class', 'row')

            rows.exit()
                .transition()
                .duration(duration)
                .style('fill-opacity', 0)
                .remove()

            rows.transition()
                .duration(duration)
                .attr('transform', function (d, i) { return 'translate(' + yLabelWidth + ',' + (maxR * i * 2 + maxR + xLabelHeight) + ')' })

            var dots = rows.selectAll('circle')
                .data(function (d) { return d.values })

            dots.enter().append('circle')
                .attr('cy', 0)
                .attr('r', 0)
                .style('fill', '#ffffff')
                .text(function (d) { return d })

            dots.exit()
                .transition()
                .duration(duration)
                .attr('r', 0)
                .remove()

            dots.transition()
                .duration(duration)
                .attr('r', function (d) { return r(d) })
                .attr('cx', function (d, i) { return i * maxR * 2 + maxR })
                .style('fill', function (d) { return 'rgb(' + c(d) + ',' + c(d) + ',' + c(d) + ')' })

            var dotLabels = rows.selectAll('.dot-label')
                .data(function (d) { return d.values })

            var dotLabelEnter = dotLabels.enter().append('g')
                .attr('class', 'dot-label')
                .on('mouseover', function (d) {
                    var selection = d3.select(this)
                    selection.select('rect').transition().duration(100).style('opacity', 1)
                    selection.select("text").transition().duration(100).style('opacity', 1)
                })
                .on('mouseout', function (d) {
                    var selection = d3.select(this)
                    selection.select('rect').transition().style('opacity', 0)
                    selection.select("text").transition().style('opacity', 0)
                })

            dotLabelEnter.append('rect')
                .style('fill', '#000000')
                .style('opacity', 0)

            dotLabelEnter.append('text')
                .style('text-anchor', 'middle')
                .style('fill', '#ffffff')
                .style('opacity', 0)

            dotLabels.exit().remove()

            dotLabels
                .attr('transform', function (d, i) { return 'translate(' + (i * maxR * 2) + ',' + (-maxR) + ')' })
                .select('text')
                .text(function (d) { return d })
                .attr('y', maxR + 4)
                .attr('x', maxR)

            dotLabels
                .select('rect')
                .attr('width', maxR * 2)
                .attr('height', maxR * 2)

            var xLabels = chart.selectAll('.xLabel')
                .data(labelsX)

            xLabels.enter().append('text')
                .attr('y', xLabelHeight)
                .attr('transform', 'translate(0,-6)')
                .attr('class', 'xLabel')
                .style('text-anchor', 'middle')
                .style('fill-opacity', 0)

            xLabels.exit()
                .transition()
                .duration(duration)
                .style('fill-opacity', 0)
                .remove()

            xLabels.transition()
                .text(function (d) { return d })
                .duration(duration)
                .attr('x', function (d, i) { return maxR * i * 2 + maxR + yLabelWidth })
                .style('fill-opacity', .7)

            var yLabels = chart.selectAll('.yLabel')
                .data(data, function (d) { return d.label })

            yLabels.enter().append('text')
                .text(function (d) { return d.label })
                .attr('x', yLabelWidth)
                .attr('class', 'yLabel')
                .style('text-anchor', 'end')
                .style('fill-opacity', 0)

            yLabels.exit()
                .transition()
                .duration(duration)
                .style('fill-opacity', 0)
                .remove()

            yLabels.transition()
                .duration(duration)
                .attr('y', function (d, i) { return maxR * i * 2 + maxR + xLabelHeight })
                .attr('transform', 'translate(-6,' + maxR / 2.5 + ')')
                .style('fill-opacity', .7)

            var vert = chart.selectAll('.vert')
                .data(labelsX)

            vert.enter().append('line')
                .attr('class', 'vert')
                .attr('y1', xLabelHeight + borderWidth / 2)
                .attr('stroke', '#888')
                .attr('stroke-width', 1)
                .style('shape-rendering', 'crispEdges')
                .style('stroke-opacity', 0)

            vert.exit()
                .transition()
                .duration(duration)
                .style('stroke-opacity', 0)
                .remove()

            vert.transition()
                .duration(duration)
                .attr('x1', function (d, i) { return maxR * i * 2 + yLabelWidth })
                .attr('x2', function (d, i) { return maxR * i * 2 + yLabelWidth })
                .attr('y2', maxR * 2 * data.length + xLabelHeight - borderWidth / 2)
                .style('stroke-opacity', function (d, i) { return i ? 1 : 0 })

            var horiz = chart.selectAll('.horiz').
                data(data, function (d) { return d.label })

            horiz.enter().append('line')
                .attr('class', 'horiz')
                .attr('x1', yLabelWidth + borderWidth / 2)
                .attr('stroke', '#888')
                .attr('stroke-width', 1)
                .style('shape-rendering', 'crispEdges')
                .style('stroke-opacity', 0)

            horiz.exit()
                .transition()
                .duration(duration)
                .style('stroke-opacity', 0)
                .remove()

            horiz.transition()
                .duration(duration)
                .attr('x2', maxR * 2 * labelsX.length + yLabelWidth - borderWidth / 2)
                .attr('y1', function (d, i) { return i * maxR * 2 + xLabelHeight })
                .attr('y2', function (d, i) { return i * maxR * 2 + xLabelHeight })
                .style('stroke-opacity', function (d, i) { return i ? 1 : 0 })

            border.transition()
                .duration(duration)
                .attr('width', maxR * 2 * labelsX.length)
                .attr('height', maxR * 2 * data.length)
        }
    },

    refresh: function () {
        var self = this;
        return $.when(
            timesOfDayPlugin.fetchTodData(self.tod_type),
            timesOfDayPlugin.fetchAllEvents()
        ).done(function (result) {
            self.timesOfDayData = timesOfDayPlugin.getTodData();
            self.eventsList = timesOfDayPlugin.getEventsList();
            self.updateView();
        });
    },
});

app.todview = new todview();

app.route('/analytics/times-of-day', 'times-of-day', function () {
    this.renderWhenReady(this.todview);
});

app.addPageScript("/analytics/times-of-day", function () {
    if (!production) {
        CountlyHelpers.loadJS("times-of-day/javascripts/d3.v3.min.js");
    }
});

$(document).ready(function () {
    var menu = '<a href="#/analytics/times-of-day" class="item" ">' +
        '<div class="logo fa fa-plugin" style="background-image:none; font-size:24px; text-align:center; width:35px; margin-left:14px; line-height:42px;"></div>' +
        '<div class="text" data-localize="times-of-day.plugin-title"></div>' +
        '</a>';

    $('#web-type #analytics-submenu').append(menu);
});