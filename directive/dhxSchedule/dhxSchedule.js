/// <reference path="../../typings/tsd.d.ts"/>

angular.module('ganttly').directive('dhxSchedule', function () {
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

            //===============
            //Configuration
            //===============
            var sections = [
                {
                    key: 1,
                    label: "Project A",
                    children: [
                        {
                            key: 5,
                            label: 'SW'
                        }, {
                            key: 6,
                            label: 'HW'
                        }, {
                            key: 7,
                            label: 'FS'
                        }]
                },
                { key: 2, label: "John Williams" },
                { key: 3, label: "David Miller" },
                { key: 4, label: "Linda Brown" }
            ];

            scheduler.createTimelineView({
                name: "timeline",
                x_unit: "day",
                x_date: "%m/%d",
                //                x_step: 1,
                //                x_size: 20,
                //                x_start: 16,
                //                x_length: 20,
                y_unit: sections,
                y_property: "section_id",
                render: "tree",
                folder_dy: 32,
                section_autoheight: false,
                dy: 32
            });

            //===============
            //Data loading
            //===============
            scheduler.config.lightbox.sections = [
                { name: "description", height: 130, map_to: "text", type: "textarea", focus: true },
                { name: "custom", height: 23, type: "select", options: sections, map_to: "section_id" },
                { name: "time", height: 72, type: "time", map_to: "auto" }
            ];

            scheduler.init(element[0], new Date(2009, 5, 30), "timeline");
            scheduler.parse([
                { start_date: "2009-06-5 09:00", end_date: "2009-06-30 12:00", text: "Task A-12458", section_id: 5 },
                { start_date: "2009-06-5 10:00", end_date: "2009-06-30 16:00", text: "Task A-89411", section_id: 6 },
                { start_date: "2009-06-10 10:00", end_date: "2009-06-15 14:00", text: "Task A-64168", section_id: 7 },
                { start_date: "2009-06-30 16:00", end_date: "2009-06-30 17:00", text: "Task A-46598", section_id: 7 },
                { start_date: "2009-06-30 12:00", end_date: "2009-06-30 20:00", text: "Task B-48865", section_id: 2 },
                //                { start_date: "2009-06-30 14:00", end_date: "2009-06-30 16:00", text: "Task B-44864", section_id: 2},
                //                { start_date: "2009-06-30 16:30", end_date: "2009-06-30 18:00", text: "Task B-46558", section_id: 2},
                //                { start_date: "2009-06-30 18:30", end_date: "2009-06-30 20:00", text: "Task B-45564", section_id: 2},
                { start_date: "2009-06-30 08:00", end_date: "2009-06-30 12:00", text: "Task C-32421", section_id: 3 },
                //                { start_date: "2009-06-30 14:30", end_date: "2009-06-30 16:45", text: "Task C-14244", section_id: 3},
                { start_date: "2009-06-30 09:20", end_date: "2009-06-30 12:20", text: "Task D-52688", section_id: 4 }
            ], "json");
            scheduler.openAllSections();
        }
    };
});
//# sourceMappingURL=dhxSchedule.js.map
