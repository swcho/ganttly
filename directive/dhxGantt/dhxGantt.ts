
/// <reference path="../../typings/tsd.d.ts"/>

// ref http://www.dhtmlx.com/blog/gantt-chart-angularjs-app-dhtmlxgantt/
angular.module('ganttly').directive('dhxGantt', function () {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',

        link: function ($scope, $element, $attrs, $controller) {

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
        }
    };
});
