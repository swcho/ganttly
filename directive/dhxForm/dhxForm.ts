
/// <reference path="../../typings/tsd.d.ts"/>

declare var dhtmlXForm;
declare var dateFormat;

declare module dhx {

    interface TFormItem {
        blockOffset?: number; // left-side offset of the item content (default 20)
        className?: string; // the user-defined css class for block's items
        disabled?: boolean; // disables/enables the block's items
        hidden?: boolean; // hides/shows the item. The default value - *false* (the item is shown)
        inputLeft?: number; // sets the left absolute offset of input.The attribute is applied only if the *position* is set as "absolute"
        inputTop?: number; // sets the top absolute offset of input. The attribute is applied only if the *position* is set as "absolute"
        name: string; // the identification name. Used for referring to item
        type: string;
        list?: TFormItem[]; // defines the array of nested elements
        offsetLeft?: number; // sets the left relative offset of item
        offsetTop?: number; // sets the top relative offset of item
        position?: string; // label-left, label-right, label-top or absolute, defines the position of label relative to block. As just labels are defined for block, just value absolute makes sense and is used for setting absolute label position
        width?: number; // the width of block

        label?: string;
        checked?: boolean; // for check box
        eventHandlers?: {
            onChange?: (value: any, state: boolean) => void;
            onButtonClick? : () => void;
        }
    }
}

angular.module('ganttly').directive('dhxForm', function() {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function($scope, element, $attrs, fn) {

            var formItems: dhx.TFormItem[] = $scope[$attrs['dhxFormItems']];
            var eventHandlers = {};

            function addEventHandler(formItems: dhx.TFormItem[]) {
                formItems.forEach(function(formItem) {
                    if (formItem.eventHandlers) {
                        eventHandlers[formItem.name] = formItem.eventHandlers;
                        delete formItem.eventHandlers;
                    }
                    if (formItem.type === 'block') {
                        addEventHandler(formItem.list);
                    }
                    if (formItem.name) {
                        $scope.$watch(formItem.name, (function(name) {
                            return function(newDate) {
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
                myForm.attachEvent("onChange", function (name, value, state){
                    if (eventHandlers[name] && eventHandlers[name]['onChange']) {
                        eventHandlers[name]['onChange'](value, state);
                    }
                }),
                myForm.attachEvent("onButtonClick", function (name){
                    if (eventHandlers[name] && eventHandlers[name]['onButtonClick']) {
                        eventHandlers[name]['onButtonClick']();
                    }
                })
            ];

            $scope.$on('$destroy', function() {
                console.log('dhxForm destroy');
                eventAttachIds.forEach(function(id) {
                    myForm.detachEvent(id);
                });
            });
        }
    };
});
