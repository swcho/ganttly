
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

            $scope.$watch($attrs.data, function(collection){
                gantt.clearAll();
                gantt.parse(collection, "json");
            }, true);

            //init gantt
            gantt.init($element[0]);
        }
    };
});
