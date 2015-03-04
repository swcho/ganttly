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
            function addEventHandler(formItems) {
                formItems.forEach(function (formItem) {
                    if (formItem.eventHandlers) {
                        eventHandlers[formItem.name] = formItem.eventHandlers;
                        delete formItem.eventHandlers;
                    }
                    if (formItem.type === 'block') {
                        addEventHandler(formItem.list);
                    }
                    if (formItem.name) {
                        $scope.$watch(formItem.name, (function (name) {
                            return function (newDate) {
                                if (newDate) {
                                    myForm.getInput(name).value = dateFormat("%Y-%m-%d", newDate);
                                }
                            };
                        }(formItem.name)), false);
                    }
                });
            }
            addEventHandler(formItems);
            var myForm = new dhtmlXForm(element[0], formItems);
            var eventAttachIds = [
                myForm.attachEvent("onChange", function (name, value, state) {
                    if (eventHandlers[name] && eventHandlers[name]['onChange']) {
                        eventHandlers[name]['onChange'](value, state);
                    }
                }),
                myForm.attachEvent("onButtonClick", function (name) {
                    if (eventHandlers[name] && eventHandlers[name]['onButtonClick']) {
                        eventHandlers[name]['onButtonClick']();
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