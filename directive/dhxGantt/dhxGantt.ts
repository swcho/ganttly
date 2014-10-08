
/// <reference path="../../typings/tsd.d.ts"/>

// ref http://www.dhtmlx.com/blog/gantt-chart-angularjs-app-dhtmlxgantt/

declare var dhtmlXMenuObject;

declare module dhx {

    interface TTask {
        id: string;
        text?: string;
        start_date?: Date;
        end_date?: Date;
        duration?: number;
        order?: number;
        progress?: number;
        open?: boolean;
        parent?: string;
    }

    interface TLink {
        id: string;
        source: string;
        target: string;
        type: string;
    }

    interface TData {
        tasks: TTask[];
        links: TLink[];
    }

    interface TContextCbParam {
        taskId?: string;
        linkId?: string;
        event?: any;
    }

    interface TContextMenuItem {
        id: string;
        text: string;
        cb: (param: TContextCbParam) => void;
        child?: TContextMenuItem[];
    }

    interface TContextMenu {
        menuItems: TContextMenuItem[];
    }
}

angular.module('ganttly').directive('dhxGantt', function () {

    function initGantt($element) {
//            function myFunc(task){
//                if(task.users) {
//                    return "<div class='important'>"+task.text+" ("+task.users+") </div>";
//                }
//                return task.text;
//            }

        gantt.config.columns=[
            {name:"text", tree: true, label:"작업", /*template:myFunc,*/ resize: true },
            {name:"user", label:"담당자", align: "center", resize: true },
            {name:"start_date", label:"시작일", align: "center", resize: true },
            {name:"duration",   label:"기간",   align: "center", resize: true },
            {name:"add"}
        ];

        gantt.templates.task_class  = function(start, end, task){
            var classes = {
                'Highest': 'priority_highest',
                'High': 'priority_high',
                'Normal': 'priority_normal',
                'Low': 'priority_low',
                'Lowest': 'priority_lowest'
            };
            return classes[task.priority];
        };

        //init gantt
        gantt.init($element[0]);
    }

    function setScale(scale) {
        var setScale = {
            'Day': function() {
                gantt.config.scale_unit = "day";
                gantt.config.step = 1;
                gantt.config.date_scale = "%d %M";
                gantt.config.subscales = [];
                gantt.config.scale_height = 27;
                gantt.templates.date_scale = null;
            },
            'Week': function() {
                var weekScaleTemplate = function(date){
                    var dateToStr = gantt.date.date_to_str("%d %M");
                    var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
                    return dateToStr(date) + " - " + dateToStr(endDate);
                };

                gantt.config.scale_unit = "week";
                gantt.config.step = 1;
                gantt.templates.date_scale = weekScaleTemplate;
                gantt.config.subscales = [
                    {unit:"day", step:1, date:"%D" }
                ];
                gantt.config.scale_height = 50;
            },
            'Month': function() {
                gantt.config.scale_unit = "month";
                gantt.config.date_scale = "%F, %Y";
                gantt.config.subscales = [
                    {unit:"day", step:1, date:"%j, %D" }
                ];
                gantt.config.scale_height = 50;
                gantt.templates.date_scale = null;
            },
            'Year': function() {
                gantt.config.scale_unit = "year";
                gantt.config.step = 1;
                gantt.config.date_scale = "%Y";
                gantt.config.min_column_width = 50;

                gantt.config.scale_height = 90;
                gantt.templates.date_scale = null;

                var monthScaleTemplate = function(date){
                    var dateToStr = gantt.date.date_to_str("%M");
                    var endDate = gantt.date.add(date, 2, "month");
                    return dateToStr(date) + " - " + dateToStr(endDate);
                };

                gantt.config.subscales = [
                    {unit:"month", step:3, template:monthScaleTemplate},
                    {unit:"month", step:1, date:"%M" }
                ];
            }
        };
        setScale[scale]();
        gantt.render();
    }

    function initContextMenu(contextMenu: dhx.TContextMenu) {

        var outstanding_param = {};

        var menu = new dhtmlXMenuObject();
        menu.setIconsPath("bower_components/dhtmlxMenu/sample_images/");
        menu.renderAsContextMenu();
        menu.setSkin("dhx_terrace");
        //menu.loadXML("data/dhxmenu.xml");
        var cbMap = (function() {
            var _cbMap = {};
            return {
                addMap: function(id, cb) {
                    if (_cbMap[id]) {
                        throw "Id already exists";
                    }
                    _cbMap[id] = cb;
                },
                call: function(id, param) {
                    _cbMap[id](param);
                }
            }
        })();
        contextMenu.menuItems.forEach(function(menuItem, pos) {
            menu.addNewChild(null, pos, menuItem.id, menuItem.text);
            cbMap.addMap(menuItem.id, menuItem.cb);
            if (menuItem.child) {
                menuItem.child.forEach(function(child) {
                    menu.addNewChild(menuItem.id, pos, child.id, child.text);
                    cbMap.addMap(child.id, child.cb);
                });
            }
        });
        menu.attachEvent("onClick", function(id, zoneId, cas) {
            cbMap.call(id, outstanding_param);
        });

        gantt.attachEvent("onContextMenu", function(taskId, linkId, event){
            var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
                y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

            outstanding_param = {
                taskId: taskId,
                linkId: linkId,
                event: event
            };

            if(taskId){
                menu.showContextMenu(x, y);
            }else if(linkId){
                menu.showContextMenu(x, y);
            }

            if(taskId || linkId){
                return false;
            }

            return true;
        });
    }

    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',

        link: function ($scope, $element, $attrs, $controller) {

            initGantt($element);

            //size of gantt
            $scope.$watch(function () {
                return $element[0].offsetWidth + "." + $element[0].offsetHeight;
            }, function () {
                gantt.setSizes();
            });

            $scope.$watch($attrs['dhxData'], function(collection){
                gantt.clearAll();
                gantt.parse(collection, "json");
            }, true);

            $scope.$watch($attrs['dhxScale'], function(scale){
                setScale(scale);
            }, true);

            var eventAttachIds = [
                gantt.attachEvent("onAfterTaskAdd", function(id, item) {
                    if ($attrs['dhxTaskAdd']) {
                        $scope[$attrs['dhxTaskAdd']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onAfterTaskUpdate", function(id, item) {
                    if ($attrs['dhxTaskUpdate']) {
                        $scope[$attrs['dhxTaskUpdate']](id, item);
                    }
                }),
                gantt.attachEvent("onAfterTaskDelete", function(id, item) {
                    if ($attrs['dhxTaskDelete']) {
                        $scope[$attrs['dhxTaskDelete']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkAdd", function(id, item) {
                    if ($attrs['dhxLinkAdd']) {
                        $scope[$attrs['dhxLinkAdd']](id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkUpdate", function(id, item) {
                    if ($attrs['dhxLinkUpdate']) {
                        $scope[$attrs['dhxLinkUpdate']](id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkDelete", function(id, item) {
                    if ($attrs['dhxLinkDelete']) {
                        $scope[$attrs['dhxLinkDelete']](id, item);
                    }
                })
            ];

            $scope.$on('$destroy', function() {
                eventAttachIds.forEach(function(id) {
                    gantt.detachEvent(id);
                });
            });

            if ($attrs['dhxContextMenu']) {
                initContextMenu($scope[$attrs['dhxContextMenu']]);
            }
        }
    };
});
