/// <reference path="../../typings/tsd.d.ts"/>

declare var dhtmlXCombo;

declare module dhx {

    interface TSection {
        key: string;
        label: string;
        children?: TSection[];
    }

    interface TEventItem {
        start_date: Date;
        end_date: Date;
        text: string;
        section_id: string;
    }
}

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

            var padding_top = parseInt(element.css('padding-top'), 10);
            if (padding_top) {
                console.warn('padding-top: ' + padding_top);
                var parent_height = element.parent().height();
                console.warn('parent height: ' + parent_height);
                var height = parent_height - padding_top * 2 - 1;
                element.height(height);
            }

            //===============
            //Configuration
            //===============
            var sections = [
                {
                    key: 1,
                    label: "Project A",
                    children: [{
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
                {key: 2, label: "John Williams"},
                {key: 3, label: "David Miller"},
                {key: 4, label: "Linda Brown"}
            ];

            scheduler.createTimelineView({
                name: "timeline",
                x_unit: "day",
                x_date: "%m/%d",
//                x_step: 1,
//                x_size: 20,
//                x_start: 16,
                x_length: 3,
//                y_unit: sections,
                y_property: "section_id",
                render: "tree",

                folder_dy: 32,
                section_autoheight: false,
                dy: 32
            });

            //===============
            //Data loading
            //===============
//            scheduler.config.lightbox.sections=[
//                {name:"description", height:130, map_to:"text", type:"textarea" , focus:true},
//                {name:"custom", height:23, type:"select", options:sections, map_to:"section_id" },
//                {name:"time", height:72, type:"time", map_to:"auto"}
//            ];

            scheduler.init(element[0], new Date(2009, 5, 30), "timeline");
            scheduler.clearAll();
//            scheduler.parse([
//                { start_date: "2009-06-5 09:00", end_date: "2009-06-30 12:00", text: "Task A-12458", section_id: 5},
//                { start_date: "2009-06-5 10:00", end_date: "2009-06-30 16:00", text: "Task A-89411", section_id: 6},
//                { start_date: "2009-06-10 10:00", end_date: "2009-06-15 14:00", text: "Task A-64168", section_id: 7},
//                { start_date: "2009-06-30 16:00", end_date: "2009-06-30 17:00", text: "Task A-46598", section_id: 7},
//
//                { start_date: "2009-06-30 12:00", end_date: "2009-06-30 20:00", text: "Task B-48865", section_id: 2},
////                { start_date: "2009-06-30 14:00", end_date: "2009-06-30 16:00", text: "Task B-44864", section_id: 2},
////                { start_date: "2009-06-30 16:30", end_date: "2009-06-30 18:00", text: "Task B-46558", section_id: 2},
////                { start_date: "2009-06-30 18:30", end_date: "2009-06-30 20:00", text: "Task B-45564", section_id: 2},
//
//                { start_date: "2009-06-30 08:00", end_date: "2009-06-30 12:00", text: "Task C-32421", section_id: 3},
////                { start_date: "2009-06-30 14:30", end_date: "2009-06-30 16:45", text: "Task C-14244", section_id: 3},
//
//                { start_date: "2009-06-30 09:20", end_date: "2009-06-30 12:20", text: "Task D-52688", section_id: 4},
////                { start_date: "2009-06-30 11:40", end_date: "2009-06-30 16:30", text: "Task D-46588", section_id: 4},
////                { start_date: "2009-06-30 12:00", end_date: "2009-06-30 18:00", text: "Task D-12458", section_id: 4}
//            ], "json");
//            scheduler.openAllSections();

        }
    };
});
