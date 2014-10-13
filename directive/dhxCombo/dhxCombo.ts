
/// <reference path="../../typings/tsd.d.ts"/>

declare var dhtmlXCombo;

declare module dhx {

    interface TComboItem {
        id: string;
        text: string;
    }

    interface TComboConfig {
        filterProvider?: (combo: any, text: string) => void;
        items?: TComboItem[];
    }
}

angular.module('ganttly').directive('dhxCombo', function() {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function($scope, element, $attrs, fn) {

            var comboConfig: dhx.TComboConfig = {};
            if ($attrs['dhxData']) {
                comboConfig = $scope[$attrs['dhxData']] || {};
            }

            var options: any = {
                parent: element[0]
            };
            if (comboConfig.filterProvider) {
                options.filter_cache = true;
            }

            var combo = new dhtmlXCombo(options);
            if (comboConfig.filterProvider) {
                combo.enableFilteringMode(true,"dummy");
                combo.attachEvent("onDynXLS", function(text){
                    comboConfig.filterProvider(combo, text);
//                    setTimeout(function() {
//                        combo.clearAll();
//                        combo.addOption([
//                            ["a",text + "option A"],
//                            ["b","option B" + text],
//                            ["c","option C" + text]
//                        ]);
//                        combo.openSelect();
//                    }, 1000);
                });
            }

            if (comboConfig.items) {
                combo.clearAll();
                comboConfig.items.forEach(function(item) {
                    combo.addOption(item.id, item.text);
                });
            }

            if ($attrs['dhxSelected']) {
                combo.setComboValue($scope[$attrs['dhxSelected']]);
            }

            combo.attachEvent("onChange", function(){
                if ($attrs['dhxSelected']) {
                    $scope[$attrs['dhxSelected']] = combo.getSelectedValue();
                    $scope.$apply();
                }
                if ($attrs['dhxChange']) {
                    $scope[$attrs['dhxChange']](combo.getSelectedValue());
                }
            });
        }
    };
});
