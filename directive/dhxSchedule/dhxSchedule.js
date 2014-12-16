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
            });
        }
    };
});
//# sourceMappingURL=dhxSchedule.js.map
