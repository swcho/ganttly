
/// <reference path="../../typings/tsd.d.ts"/>

// ref http://www.dhtmlx.com/blog/gantt-chart-angularjs-app-dhtmlxgantt/

declare var dhtmlXMenuObject;

angular.module('ganttly').directive('dhxGantt', function () {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',

        link: function ($scope, $element, $attrs, $controller) {
//            function myFunc(task){
//                if(task.users) {
//                    return "<div class='important'>"+task.text+" ("+task.users+") </div>";
//                }
//                return task.text;
//            }

            gantt.config.columns=[
                {name:"text", tree: true, label:"작업", /*template:myFunc,*/ resize: true },
                {name:"user", label:"담당자", align: "center", resize: true },
                {name:"start_date", label:"시작일", align: "center", resize: true },
                {name:"duration",   label:"기간",   align: "center", resize: true }
            ];

            gantt.templates.task_class  = function(start, end, task){
                var classes = {
                    'Highest': 'priority_highest',
                    'High': 'priority_high',
                    'Normal': 'priority_normal',
                    'Low': 'priority_low',
                    'Lowest': 'priority_lowest'
                };
                return classes[task.priority];
            };

            //init gantt
            gantt.init($element[0]);

            //size of gantt
            $scope.$watch(function () {
                return $element[0].offsetWidth + "." + $element[0].offsetHeight;
            }, function () {
                gantt.setSizes();
            });

            $scope.$watch($attrs['data'], function(collection){
                gantt.clearAll();
                gantt.parse(collection, "json");
            }, true);


            var eventAttachIds = [
                gantt.attachEvent("onAfterTaskAdd", function(id, item) {
                    if ($attrs['dhxTaskAdd']) {
                        $scope[$attrs['dhxTaskAdd']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onAfterTaskUpdate", function(id, item) {
                    if ($attrs['dhxTaskUpdate']) {
                        $scope[$attrs['dhxTaskUpdate']](id, item);
                    }
                }),
                gantt.attachEvent("onAfterTaskDelete", function(id, item) {
                    if ($attrs['dhxTaskDelete']) {
                        $scope[$attrs['dhxTaskDelete']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkAdd", function(id, item) {
                    if ($attrs['dhxLinkAdd']) {
                        $scope[$attrs['dhxLinkAdd']](id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkUpdate", function(id, item) {
                    if ($attrs['dhxLinkUpdate']) {
                        $scope[$attrs['dhxLinkUpdate']](id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkDelete", function(id, item) {
                    if ($attrs['dhxLinkDelete']) {
                        $scope[$attrs['dhxLinkDelete']](id, item);
                    }
                })
            ];

            $scope.$on('$destroy', function() {
                eventAttachIds.forEach(function(id) {
                    gantt.detachEvent(id);
                });
            });

            var menu = new dhtmlXMenuObject();
            menu.setIconsPath("bower_components/dhtmlxMenu/sample_images/");
            menu.renderAsContextMenu();
            menu.setSkin("dhx_terrace");
            menu.loadXML("data/dhxmenu.xml");

            gantt.attachEvent("onContextMenu", function(taskId, linkId, event){
                var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
                    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

                if(taskId){
                    menu.showContextMenu(x, y);
                }else if(linkId){
                    menu.showContextMenu(x, y);
                }

                if(taskId || linkId){
                    return false;
                }

                return true;
            });
        }
    };
});
