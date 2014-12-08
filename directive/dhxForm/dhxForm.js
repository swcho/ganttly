/// <reference path="../../typings/tsd.d.ts"/>

angular.module('ganttly').directive('dhxForm', function () {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function ($scope, element, $attrs, fn) {
            var formItems = $scope[$attrs['dhxFormItems']];
            var formDataList = [];
            var eventHandlers = {};

            formItems.forEach(function (formItem) {
                formDataList.push(formItem.data);
                eventHandlers[formItem.data.name] = formItem.eventHandlers;
            });

            var myForm = new dhtmlXForm(element[0], formDataList);

            var eventAttachIds = [
                myForm.attachEvent("onChange", function (name, value, state) {
                    eventHandlers[name]['onChange'](value, state);
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
