
/// <reference path="../../typings/tsd.d.ts"/>

declare var dhtmlXForm;

declare module dhx {

    interface TFormItemData {
        blockOffset?: number; // left-side offset of the item content (default 20)
        className?: string; // the user-defined css class for block's items
        disabled?: boolean; // disables/enables the block's items
        hidden?: boolean; // hides/shows the item. The default value - *false* (the item is shown)
        inputLeft?: number; // sets the left absolute offset of input.The attribute is applied only if the *position* is set as "absolute"
        inputTop?: number; // sets the top absolute offset of input. The attribute is applied only if the *position* is set as "absolute"
        name: string; // the identification name. Used for referring to item
        type: string;
        list?: any[]; // defines the array of nested elements
        offsetLeft?: number; // sets the left relative offset of item
        offsetTop?: number; // sets the top relative offset of item
        position?: string; // label-left, label-right, label-top or absolute, defines the position of label relative to block. As just labels are defined for block, just value absolute makes sense and is used for setting absolute label position
        width?: number; // the width of block

        label?: string;
        checked?: boolean; // for check box
    }

    interface TFormItem {
        data: TFormItemData
        eventHandlers?: {
            onChange?: (value: any, state: boolean) => void;
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
            var formDataList: dhx.TFormItemData[] = [];
            var eventHandlers = {};

            formItems.forEach(function(formItem) {
                formDataList.push(formItem.data);
                eventHandlers[formItem.data.name] = formItem.eventHandlers;
            });

            var myForm = new dhtmlXForm(element[0], formDataList);

            var eventAttachIds = [
                myForm.attachEvent("onChange", function (name, value, state){
                    eventHandlers[name]['onChange'](value, state);
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
