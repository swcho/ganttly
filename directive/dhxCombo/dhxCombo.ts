
/// <reference path="../../typings/tsd.d.ts"/>

declare var dhtmlXCombo;

angular.module('ganttly').directive('dhxCombo', function() {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function(scope, element, attrs, fn) {
            var combo = new dhtmlXCombo({
                parent: element[0],
                filter_cache: true
            });
            combo.enableFilteringMode(true,"dummy");
            combo.attachEvent("onDynXLS", function(text){
                setTimeout(function() {
                    combo.clearAll();
                    combo.addOption([
                        ["a",text + "option A"],
                        ["b","option B" + text],
                        ["c","option C" + text]
                    ]);
                    combo.openSelect();
                }, 1000);
            });
            combo.attachEvent("onChange", function(){
                console.log('onChanged');
            });
        }
    };
});
