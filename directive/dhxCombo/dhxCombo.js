/// <reference path="../../typings/tsd.d.ts"/>
angular.module('ganttly').directive('dhxCombo', function () {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function ($scope, element, $attrs, fn) {
            var comboFilter;
            if ($attrs['dhxFilter']) {
                comboFilter = $scope[$attrs['dhxFilter']] || null;
            }
            var options = {
                parent: element[0]
            };
            if (comboFilter) {
                options.filter_cache = true;
            }
            var combo = new dhtmlXCombo(options);
            if (comboFilter) {
                combo.enableFilteringMode(true, "dummy");
                combo.attachEvent("onDynXLS", function (text) {
                    comboFilter(text, function (items) {
                        var options = [];
                        combo.clearAll();
                        items.forEach(function (item) {
                            options.push([item.id, item.text]);
                        });
                        combo.addOption(options);
                        combo.openSelect();
                    });
                });
            }
            $scope.$watch($attrs['dhxData'], function (items) {
                if (items) {
                    combo.clearAll();
                    items.forEach(function (item) {
                        combo.addOption(item.id, item.text);
                    });
                }
            });
            $scope.$watch($attrs['dhxDisabled'], function (disabled) {
                if (disabled) {
                    combo.disable();
                }
                else {
                    combo.enable();
                }
            });
            $scope.$watch($attrs['dhxSelected'], function (selected) {
                if (selected) {
                    combo.setComboValue(selected);
                }
            });
            var eventAttachIds = [
                combo.attachEvent("onChange", function () {
                    //                    console.log('onChange');
                    if ($attrs['dhxSelected']) {
                        $scope[$attrs['dhxSelected']] = combo.getSelectedValue();
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                    if ($attrs['dhxChange']) {
                        $scope[$attrs['dhxChange']](combo.getSelectedValue());
                    }
                })
            ];
            $scope.$on('$destroy', function () {
                //                console.log('dhxCombo destroy');
                eventAttachIds.forEach(function (id) {
                    combo.detachEvent(id);
                });
            });
        }
    };
});
//# sourceMappingURL=dhxCombo.js.map