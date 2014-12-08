
/// <reference path="../../typings/tsd.d.ts"/>

// ref http://www.dhtmlx.com/blog/gantt-chart-angularjs-app-dhtmlxgantt/

declare var dhtmlXMenuObject;
declare var dhtmlx;
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
        user?: string;
        userIdList?: string[];
        estimatedMillis?: number;
        estimatedDays?: number;
        depends?: string[];
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

angular.module('ganttly').directive('dhxGantt', function ($calendar) {

    var unitDay = 1000 * 60 * 60 * 24;
    var unitHour = 1000 * 60 * 60;

    function initGantt($element) {
        var classes_priority = {
            'Highest': 'priority_highest',
            'High': 'priority_high',
            'Normal': 'priority_normal',
            'Low': 'priority_low',
            'Lowest': 'priority_lowest'
        };
        var classes_status = {
            'None': 'status_none',
            'New': 'status_new',
            'Suspended': 'status_suspended',
            'In progress': 'status_in_progress',
            'Partly completed': 'status_partly_completed',
            'Completed': 'status_completed'
        };

        function myFunc(task){
            var classNames = classes_priority[task.priority] + ' ' + classes_status[task.status]
            return "<div class='" + classNames + "'>"+ task.text + "</div>";
        }

        // Column configurations
        gantt.config.columns=[
            {name:"text", tree: true, label:"작업", template:myFunc, width: 200, resize: true },
            {name:"user", label:"담당자", align: "center", width: 60, resize: true },
            {name:"start_date", label:"시작일", align: "center", width: 90, resize: true },
            {name:"duration",   label:"기간",   align: "center", width: 40, resize: true },
            {name:"add", width: 40 }
        ];

        // Autosize
//        gantt.config.autosize = true;

        // Set task bar's class by priority
        gantt.templates.task_class  = function(start, end, task){
            var classes_priority = {
                'Highest': 'priority_highest',
                'High': 'priority_high',
                'Normal': 'priority_normal',
                'Low': 'priority_low',
                'Lowest': 'priority_lowest'
            };
            var classes_status = {
                'None': 'status_none',
                'New': 'status_new',
                'Suspended': 'status_suspended',
                'In progress': 'status_in_progress',
                'Partly completed': 'status_partly_completed',
                'Completed': 'status_completed'
            };
            return classes_priority[task.priority] + ' ' + classes_status[task.status];
        };
        gantt.templates.task_row_class = function(start, end, task) {
            return classes_priority[task.priority] + ' ' + classes_status[task.status];
        };

        // Highlight weekend
        gantt.templates.scale_cell_class = function(date){
            if ($calendar.isHoliday(date)) {
                return "holiday";
            }
            if (date.getDay()===0 || date.getDay()===6){
                return "weekend";
            }
        };
        gantt.templates.task_cell_class = function(item, date){
            if ($calendar.isHoliday(date)) {
                return "holiday";
            }
            if (date.getDay()===0 || date.getDay()===6){
                return "weekend"
            }
        };

        // Task tooltip
        gantt.templates.tooltip_text = function(start,end,task){

            var descriptions = [
                "<b>Task:</b> " + task.text,
                "<b>Start date:</b> " + gantt.templates.tooltip_date_format(start),
                "<b>End date:</b> " + gantt.templates.tooltip_date_format(end),
                "<b>Duration:</b> " + task.duration,
                "<b>Est. Days:</b> " + task.estimatedDays,
                "<b>Progress:</b> " + (task.progress ? task.progress.toFixed(2) : 0)
            ];

            return descriptions.join('<br/>');
        };

        // Mark today
        var date_to_str = gantt.date.date_to_str(gantt.config.task_date);
        gantt.addMarker({ start_date: new Date(), css: "today", title:date_to_str( new Date()), text:'오늘'});

        gantt.config.lightbox.sections = [
            {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
//            {name: "priority", height: 22, map_to: "priority", type: "select", options: [
//                {key: "Hight", label: "Hight"},
//                {key: "Normal", label: "Normal"},
//                {key: "Low", label: "Low"}
//            ]},
//            {name: "time", height: 72, type: "time", map_to: "auto", time_format: ["%d", "%m", "%Y", "%H:%i"]}
            {
                name:"time",
                height:72,
                map_to: {
                    start_date: 'start_date',
                    end_date: "end_date",
                    duration: 'estimatedDays'
                },
                type:"duration"
            }
        ];

        //init gantt
        gantt.init($element[0]);
    }

    function setScale(scale) {
        var _setScale = {
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
                    var dateToStr = gantt.date.date_to_str("%M w%W");
                    return dateToStr(date);
                };

                gantt.config.scale_unit = "week";
                gantt.config.step = 1;
                gantt.templates.date_scale = weekScaleTemplate;
                gantt.config.subscales = [
                    {
                        unit:"day",
                        step:1,
//                        date:"%d %D",
                        template: function(date) {
                            var dateToStr = gantt.date.date_to_str("%d %D");
                            var holiday = $calendar.isHoliday(date);
                            return holiday ? holiday.title + '<br>' + dateToStr(date): dateToStr(date);
                        }
                    }
                ];
                gantt.config.scale_height = 50;
            },
            'Month': function() {
                gantt.config.scale_unit = "month";
                gantt.config.date_scale = "%F, %Y";
                gantt.config.subscales = [
                    {unit:"week", step:1, date:"Week #%W" }
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
                    var quarter = {
                        'Jan': '1',
                        'Apr': '2',
                        'Jul': '3',
                        'Oct': '4'
                    };
                    return quarter[dateToStr(date)] + 'Q';
                };

                gantt.config.subscales = [
                    {unit:"month", step:3, template:monthScaleTemplate},
                    {unit:"month", step:1, date:"%M" }
                ];
            }
        };
        console.log(scale);
        _setScale[scale]();
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
        var _is_tooltip_orig;
        menu.attachEvent("onShow", function() {
            gantt['_hide_tooltip']();
            _is_tooltip_orig = gantt['_is_tooltip'];
            gantt['_is_tooltip'] = function() {
                return true;
            };
        });
        menu.attachEvent("onHide", function() {
            gantt['_is_tooltip'] = _is_tooltip_orig;
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

//            $scope.$watch($attrs['dhxData'], function(collection){
//                gantt.clearAll();
//                gantt.parse(collection, "json");
//            }, false);

//            $scope.$watch($attrs['dhxScale'], function(scale){
//                setScale(scale);
//            }, true);

            var taskChangeMode;
            var moveStartDate;
            var eventAttachIds = [
            /**
             * Task selection
             */
                gantt.attachEvent("onTaskClick", function(id, e) {
                    var taskClickWithShift = e ? e.shiftKey: false;
                    if ($attrs['dhxTaskShiftClicked'] && taskClickWithShift) {
                        $scope[$attrs['dhxTaskShiftClicked']](gantt, id);
                        return false;
                    }
                    return true;
                }),
                gantt.attachEvent("onTaskSelected", function(id,item){
                    if ($attrs['dhxTaskSelected']) {
                        $scope[$attrs['dhxTaskSelected']](gantt, id, item);
                    }
                }),
            /**
             * Task editing events
             */
                gantt.attachEvent("onAfterTaskAdd", function(id, item) {
                    if ($attrs['dhxTaskAdd']) {
                        $scope[$attrs['dhxTaskAdd']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onBeforeTaskChanged", function(id, mode, task) {
//                    console.log('onBeforeTaskChanged: ' + mode + ', ' + task.start_date);
                    if (mode === "move") {
                        moveStartDate = task.start_date;
                    }
                    taskChangeMode = mode;
                    return true;
                }),
                gantt.attachEvent("onAfterTaskUpdate", function(id, item) {
                    gantt['_hide_tooltip']();
//                    console.log('onAfterTaskUpdate: ' + taskChangeMode + ', ' + moveStartDate);
//                    console.log(item);
                    if (taskChangeMode === "move" && moveStartDate.getTime() === item.start_date.getTime()) {
                        console.log('skip not necessary move event');
                        return;
                    }
                    if ($attrs['dhxTaskUpdate']) {
                        $scope[$attrs['dhxTaskUpdate']](id, item, taskChangeMode);
                        taskChangeMode = '';
                    }
                }),
                gantt.attachEvent("onAfterTaskDelete", function(id, item) {
                    if ($attrs['dhxTaskDelete']) {
                        $scope[$attrs['dhxTaskDelete']](gantt, id, item);
                    }
                }),

            /**
             *  Task open/close event
             */
                gantt.attachEvent("onTaskOpened", function(id) {
                    if ($attrs['dhxTaskOpened']) {
                        $scope[$attrs['dhxTaskOpened']](gantt, id);
                    }
                }),
                gantt.attachEvent("onTaskClosed", function(id) {
                    if ($attrs['dhxTaskClosed']) {
                        $scope[$attrs['dhxTaskClosed']](gantt, id);
                    }
                }),

            /**
             * Link editing events
             */
                gantt.attachEvent("onAfterLinkAdd", function(id, item) {
                    if ($attrs['dhxLinkAdd']) {
                        $scope[$attrs['dhxLinkAdd']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkUpdate", function(id, item) {
                    if ($attrs['dhxLinkUpdate']) {
                        $scope[$attrs['dhxLinkUpdate']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkDelete", function(id, item) {
                    if ($attrs['dhxLinkDelete']) {
                        $scope[$attrs['dhxLinkDelete']](gantt, id, item);
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
