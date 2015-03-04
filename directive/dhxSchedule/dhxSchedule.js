/// <reference path="../../typings/tsd.d.ts"/>
angular.module('ganttly').directive('dhxSchedule', function ($calendar) {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        //        template: '<div ng-transclude></div>',
        templateUrl: 'directive/dhxSchedule/dhxSchedule.html',
        link: function ($scope, element, $attrs, fn) {
            console.log('dhxSchedule.js');
            scheduler.config.readonly = true;
            scheduler.locale.labels.timeline_tab = "Timeline";
            scheduler.locale.labels.section_custom = "Section";
            scheduler.config.details_on_create = true;
            scheduler.config.details_on_dblclick = true;
            scheduler.config.xml_date = "%Y-%m-%d %H:%i";
            var format = scheduler.date.date_to_str("%Y-%m-%d %H:%i");
            scheduler.templates.tooltip_text = function (start, end, event) {
                return "<b>Summary:</b> " + event.comment + "<br/>" + "<b>Event:</b> " + event.text + "<br/>" + "<b>Start date:</b> " + format(start) + "<br/>" + "<b>End date:</b> " + format(end);
            };
            scheduler.templates.event_class = function (start, end, ev) {
                return "";
            };
            var padding_top = parseInt(element.css('padding-top'), 10);
            if (padding_top) {
                console.warn('padding-top: ' + padding_top);
                var parent_height = element.parent().height();
                console.warn('parent height: ' + parent_height);
                var height = parent_height - padding_top * 2 - 1;
                element.height(height);
            }
            scheduler.createTimelineView({
                name: "timeline",
                x_unit: "day",
                x_date: "%m/%d",
                //                x_step: 1,
                //                x_size: 20,
                //                x_start: 16,
                x_length: 3,
                y_unit: [],
                y_property: "section_id",
                render: "tree",
                folder_dy: 24,
                //                event_dy: 28,
                section_autoheight: false,
                dy: 24
            });
            scheduler.templates.timeline_cell_class = function (evs, date, section) {
                if ($calendar.isHoliday(date)) {
                    return "holiday";
                }
                if (date.getDay() === 0 || date.getDay() === 6) {
                    return "weekend";
                }
                return '';
            };
            scheduler.templates.timeline_scalex_class = function (date) {
                if ($calendar.isHoliday(date)) {
                    return "holiday";
                }
                if (date.getDay() === 0 || date.getDay() === 6) {
                    return "weekend";
                }
                return '';
            };
            scheduler.clearAll();
            scheduler.init(element[0], new Date(2009, 5, 30), "timeline");
            scheduler.updateView();
            var eventAttachIds = [
                scheduler.attachEvent("onClick", function (id, e) {
                    if ($attrs['dhxScheduleOnClick']) {
                        $scope[$attrs['dhxScheduleOnClick']](scheduler, id);
                        return false;
                    }
                    return true;
                })
            ];
            $scope.$on('$destroy', function () {
                eventAttachIds.forEach(function (id) {
                    scheduler.detachEvent(id);
                });
                scheduler.clearAll();
            });
        }
    };
});
//# sourceMappingURL=dhxSchedule.js.map