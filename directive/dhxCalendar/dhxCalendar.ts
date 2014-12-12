
/// <reference path="../../typings/tsd.d.ts"/>

declare var dhtmlXCalendarObject;

declare module dhx {

}

angular.module('ganttly').directive('dhxCalendar', function() {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function($scope, element, $attrs, fn) {
            var calendar = new dhtmlXCalendarObject(element[0]);
        }
    };
});
