
/// <reference path="../../defs/codeBeamer.d.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>

// ref http://www.dhtmlx.com/blog/gantt-chart-angularjs-app-dhtmlxgantt/
angular.module('ganttly').directive('dhxGantt', function () {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',

        link: function ($scope, $element, $attrs, $controller) {
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

            //init gantt
            gantt.init($element[0]);

            var eventAttachIds = [
                gantt.attachEvent("onAfterTaskUpdate", function(id, item) {
                    if ($attrs['dhxTaskUpdate']) {
                        $scope[$attrs['dhxTaskUpdate']](id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkAdd", function(id, item) {
                    if ($attrs['dhxLinkAdd']) {
                        $scope[$attrs['dhxLinkAdd']](id, item);
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
