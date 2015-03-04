/// <reference path="../../typings/tsd.d.ts"/>
angular.module('ganttly').directive('dhxCalendar', function () {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function ($scope, element, $attrs, fn) {
            var calendar = new dhtmlXCalendarObject(element[0]);
        }
    };
});
//# sourceMappingURL=dhxCalendar.js.map