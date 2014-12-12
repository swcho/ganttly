/// <reference path="../../typings/tsd.d.ts"/>

angular.module('ganttly').directive('dhxForm', function () {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function ($scope, element, $attrs, fn) {
            var formItems = $scope[$attrs['dhxFormItems']];
            var eventHandlers = {};

            formItems.forEach(function (formItem) {
                if (formItem.eventHandlers) {
                    eventHandlers[formItem.name] = formItem.eventHandlers;
                    delete formItem.eventHandlers;
                }
            });

            var myForm = new dhtmlXForm(element[0], formItems);

            var eventAttachIds = [
                myForm.attachEvent("onChange", function (name, value, state) {
                    if (eventHandlers[name] && eventHandlers[name]['onChange']) {
                        eventHandlers[name]['onChange'](value, state);
                    }
                })
            ];

            $scope.$on('$destroy', function () {
                console.log('dhxForm destroy');
                eventAttachIds.forEach(function (id) {
                    myForm.detachEvent(id);
                });
            });
        }
    };
});
//# sourceMappingURL=dhxForm.js.map
