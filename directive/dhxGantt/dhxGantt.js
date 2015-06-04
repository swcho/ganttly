/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../lib/Calendar.ts"/>
var DhxGanttExt;
(function (DhxGanttExt) {
    (function (TTaskType) {
        TTaskType[TTaskType["None"] = 0] = "None";
        TTaskType[TTaskType["User"] = 1] = "User";
        TTaskType[TTaskType["Project"] = 2] = "Project";
        TTaskType[TTaskType["Release"] = 3] = "Release";
    })(DhxGanttExt.TTaskType || (DhxGanttExt.TTaskType = {}));
    var TTaskType = DhxGanttExt.TTaskType;
    var date_to_str = gantt.date.date_to_str('%Y.%m.%d');
    function formatDate(date) {
        return date_to_str(date);
    }
    DhxGanttExt.formatDate = formatDate;
    function init($element) {
        var classes_priority = {
            'Highest': 'priority_highest',
            'High': 'priority_high',
            'Normal': 'priority_normal',
            'Low': 'priority_low',
            'Lowest': 'priority_lowest'
        };
        var classes_status = {
            //            'None': 'status_none',
            //            'New': 'status_new',
            //            'Suspended': 'status_suspended',
            //            'In progress': 'status_in_progress',
            //            'Partly completed': 'status_partly_completed',
            'Completed': 'status_completed',
            'Closed': 'status_completed'
        };
        function columnTaskRender(task) {
            var classNames = [];
            //            if (classes_priority[task.priority]) {
            //                classNames.push(classes_priority[task.priority]);
            //            }
            if (classes_status[task._status]) {
                classNames.push(classes_status[task._status]);
            }
            var styles = [];
            if (task.color) {
                styles.push('color: ' + task.color);
            }
            return "<div class='" + classNames.join(' ') + "' style='" + styles.join(';') + "'>" + task.text + "</div>";
        }
        // Column configurations
        gantt.config.columns = [
            { name: "text", tree: true, label: "Task/Group", template: columnTaskRender, width: 200, resize: true },
            { name: "user", label: "User", align: "center", width: 60, resize: true },
            { name: "start_date", label: "Start", align: "center", width: 90, resize: true },
            { name: "duration", label: "Dur.", align: "center", width: 40, resize: true },
            { name: "add", width: 40 }
        ];
        gantt.config.row_height = 26;
        gantt.config.readonly = true;
        gantt.config.initial_scroll = false;
        gantt.config['preserve_scroll'] = true;
        // Autosize
        //        gantt.config.autosize = true;
        // Task class
        gantt.templates.task_class = function (start, end, task) {
            return classes_status[task._status] || '';
        };
        gantt.templates.task_row_class = function (start, end, task) {
            return task._warnings ? 'warning' : '';
        };
        // Link class
        gantt.templates.link_class = function (link) {
            var types = gantt.config.links;
            switch (link.type) {
                case types.finish_to_start:
                    return "finish_to_start";
                    break;
                case types.start_to_start:
                    return "start_to_start";
                    break;
                case types.finish_to_finish:
                    return "finish_to_finish";
                    break;
            }
        };
        // Mark today
        gantt.config.lightbox.sections = [
            { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
            {
                name: "time",
                height: 72,
                map_to: {
                    start_date: 'start_date',
                    end_date: "end_date",
                    duration: 'estimatedDays'
                },
                type: "duration"
            }
        ];
        // Tree icons: ref:http://docs.dhtmlx.com/gantt/desktop__tree_column.html
        var task_class_names = {};
        task_class_names[2 /* Project */] = 'task_type_project';
        task_class_names[1 /* User */] = 'task_type_user';
        task_class_names[3 /* Release */] = 'task_type_release';
        gantt.templates.grid_folder = function (item) {
            var icon_class_by_type = task_class_names[item._type];
            var icon_class = icon_class_by_type || 'gantt_folder_' + (item.$open ? "open" : "closed");
            return "<div class='gantt_tree_icon " + icon_class + "'></div>";
        };
        // https://www.iconfinder.com/icons/83885/information_list_icon#size=32
        gantt.templates.grid_file = function (task) {
            var icon_class_by_type = task_class_names[task._type];
            var icon_err = task._warnings ? 'task_err' : 'task_normal';
            var icon_class = icon_class_by_type || icon_err || 'gantt_file';
            return "<div class='gantt_tree_icon " + icon_class + "'></div>";
        };
        // Righ side text for milestone
        gantt.templates.rightside_text = function (start, end, task) {
            if (task.type == gantt.config.types.milestone) {
                return task.text;
            }
            return "";
        };
        // Custom task rendering for project type
        // ref: http://docs.dhtmlx.com/gantt/samples/04_customization/17_classic_gantt_look.html
        gantt.config.type_renderers[gantt.config.types.project] = function (task) {
            var main_el = document.createElement("div");
            main_el.setAttribute(gantt.config.task_attribute, task.id);
            var size = gantt.getTaskPosition(task);
            main_el.innerHTML = [
                "<div class='project-left'></div>",
                "<div class='project-right'></div>"
            ].join('');
            main_el.className = "custom-project";
            main_el.style.left = size.left + "px";
            main_el.style.top = size.top + 7 + "px";
            main_el.style.width = size.width + "px";
            return main_el;
        };
        //init gantt
        gantt.init($element[0]);
        function getMousePos(e) {
            var pos = gantt.getScrollState();
            var rect = gantt.$task_data.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            return {
                x: x,
                y: y
            };
        }
        var debug = false;
        if (debug) {
            var $debug = $('<div>').appendTo($(document.body)).addClass('debug').css({
                position: 'fixed',
                'z-index': 100,
                width: '100',
                height: '40'
            });
            var unit_per_scale = {
                'day': 1000 * 60 * 60 * 20,
                'week': 1000 * 60 * 60 * 20,
                'month': 1000 * 60 * 60 * 20 * 7,
                'year': 1000 * 60 * 60 * 20 * 365
            };
            gantt.$task_data.addEventListener('mousemove', function (e) {
                $debug.css({
                    top: e.clientY + 10,
                    left: e.clientX + 10
                });
                var pos = getMousePos(e);
                $debug.html('<p>' + pos.x + ',' + pos.y + '</p>' + '<p>' + date_to_str(getDateFromPos(pos.x)) + '</p>');
            });
        }
        gantt.$task_data.addEventListener('mousewheel', function (evt) {
            if (isTaskDrawn() && evt.ctrlKey) {
                console.log(evt);
                var prev_pos = getMousePos(evt).x;
                var prev_time = getDateFromPos(prev_pos);
                console.log(prev_time);
                var prev_scroll = gantt.getScrollState();
                var prev_x_from_scroll = prev_pos - prev_scroll.x;
                if (evt.wheelDelta > 0) {
                    decreaseScale();
                }
                else {
                    increaseScale();
                }
                gantt.render();
                var new_pos = getPosFromDate(prev_time);
                var new_time = getDateFromPos(new_pos);
                var new_time_div = prev_time.getTime() - new_time.getTime();
                console.log(new_time, new_time_div);
                if (debug && new_time_div) {
                    debugger;
                }
                gantt.scrollTo(new_pos - prev_x_from_scroll, prev_scroll.y);
                evt.returnValue = false;
                evt.cancelBubble = false;
                evt.preventDefault();
                evt.stopPropagation();
                return false;
            }
        });
    }
    DhxGanttExt.init = init;
    function setDateCentered(aDate) {
        var pos = gantt.posFromDate(aDate) - gantt.$task.offsetWidth / 2;
        var scrollState = gantt.getScrollState();
        gantt.scrollTo(pos, scrollState.y);
    }
    DhxGanttExt.setDateCentered = setDateCentered;
    function setParentOpen(aTask) {
        if (aTask.parent) {
            var parentTask = gantt.getTask(aTask.id);
            if (parentTask) {
                parentTask.open = true;
                setParentOpen(parentTask);
            }
        }
    }
    DhxGanttExt.setParentOpen = setParentOpen;
    function doDependsTasks(aTask, aCb, aLoopFunc) {
        var series = [];
        if (aTask.depends) {
            aTask.depends.forEach(function (taskId) {
                var task = gantt.getTask(taskId);
                series.push(function (cb) {
                    aLoopFunc(aTask, task, function (err) {
                        if (err) {
                            cb(err);
                            return;
                        }
                        doDependsTasks(task, cb, aLoopFunc);
                    });
                });
            });
        }
        async.series(series, function (err) {
            aCb(err);
        });
    }
    DhxGanttExt.doDependsTasks = doDependsTasks;
    function getCenterPos() {
        var prevPosition = gantt.getScrollState();
        return {
            x: prevPosition.x + (gantt.$task.offsetWidth / 2),
            y: prevPosition.y + (gantt.$task.offsetHeight / 2)
        };
    }
    function getDateFromPos(x) {
        var start_date = gantt['_min_date'];
        var end_date = gantt['_max_date'];
        var div = end_date.getTime() - start_date.getTime();
        var content_width = gantt.$task_data.offsetWidth;
        var div_date = Math.ceil((x * div) / content_width);
        return new Date(start_date.getTime() + div_date);
    }
    function getPosFromDate(date) {
        var start_date = gantt['_min_date'];
        var end_date = gantt['_max_date'];
        var div = end_date.getTime() - start_date.getTime();
        var content_width = gantt.$task_data.offsetWidth;
        var pos = Math.ceil(((date.getTime() - start_date.getTime()) * content_width) / div);
        return pos;
    }
    function getTaskIdByPos(y) {
        var tasks = gantt.$task_data.querySelectorAll('.gantt_task_row');
        var i, len = tasks.length, el, taskId, div;
        for (i = 0; i < len; i++) {
            el = tasks[i];
            taskId = el.getAttribute('task_id');
            div = y - el.offsetTop;
            if (el.offsetTop <= y && y <= el.offsetTop + el.offsetHeight) {
                break;
            }
        }
        return taskId;
    }
    function getTaskPos(aTaskId) {
        var tasks = gantt.$task_data.querySelectorAll('.gantt_task_row');
        var i, len = tasks.length, el, taskId, pos;
        for (i = 0; i < len; i++) {
            el = tasks[i];
            taskId = el.getAttribute('task_id');
            pos = {
                x: el.offsetLeft,
                y: el.offsetTop
            };
            if (aTaskId == taskId) {
                break;
            }
        }
        return pos;
    }
    function isTaskDrawn() {
        return gantt.$task_data.querySelectorAll('.gantt_task_row').length ? true : false;
    }
    function getCenteredDate() {
        var prevPosition = gantt.getScrollState();
        if (prevPosition.x || prevPosition.y) {
            var content_width = gantt.$task_data.offsetWidth;
            var prevCenter = prevPosition.x + (gantt.$task.offsetWidth / 2);
            console.error(prevCenter, '/', content_width);
            var start_date = gantt['_min_date'];
            var end_date = gantt['_max_date'];
            console.log('start', start_date);
            console.log('end  ', end_date);
            var div = end_date.getTime() - start_date.getTime();
            console.log('div  ', div);
            var div_date = Math.ceil((prevCenter * div) / content_width);
            console.log('div_date', div_date);
            var prev_start_date = new Date(start_date.getTime() + div_date);
            console.log('date ', prev_start_date);
            return prev_start_date;
        }
        return null;
    }
    DhxGanttExt.getCenteredDate = getCenteredDate;
    function getWeek(aDate) {
        var onejan = new Date(aDate.getFullYear(), 0, 1);
        return Math.ceil((((aDate - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }
    var KScaleHandlers = {
        'day': function () {
            var now = new Date();
            gantt.config.scale_unit = "day";
            gantt.config.scale_height = 50;
            gantt.config.step = 1;
            gantt.config.date_scale = "%d %M";
            gantt.config.subscales = [];
            gantt.templates.date_scale = null;
            gantt.templates.scale_cell_class = function (date) {
                if (date.getDay() === 0 || date.getDay() === 6) {
                    return 'weekend';
                }
                if (CalendarUtils.isHoliday(date)) {
                    return "holiday";
                }
                if (date.getDate() == now.getDate() && date.getMonth() == now.getMonth() && date.getFullYear() == now.getFullYear()) {
                    return 'today';
                }
                return '';
            };
            gantt.templates.task_cell_class = function (item, date) {
                if (date.getDay() === 0 || date.getDay() === 6) {
                    return 'weekend';
                }
                if (CalendarUtils.isHoliday(date)) {
                    return "holiday";
                }
                if (date.getDate() == now.getDate() && date.getMonth() == now.getMonth() && date.getFullYear() == now.getFullYear()) {
                    return 'today';
                }
                return '';
            };
        },
        'week': function (init) {
            var now = new Date();
            gantt.config.scale_unit = "week";
            gantt.config.scale_height = 50;
            gantt.config.step = 1;
            gantt.config.subscales = [{
                unit: "day",
                step: 1,
                //                        date:"%d %D",
                template: function (date) {
                    var dateToStr = gantt.date.date_to_str("%d %D");
                    var holiday = null; //$calendar.isHoliday(date);
                    return holiday ? holiday.title + '<br>' + dateToStr(date) : dateToStr(date);
                }
            }];
            gantt.templates.date_scale = function (date) {
                var dateToStr = gantt.date.date_to_str("%M w%W");
                return dateToStr(date);
            };
            gantt.templates.scale_cell_class = function (date) {
                if (init && getWeek(date) == getWeek(now)) {
                    init = false;
                    return 'today';
                }
                if (date.getDay() === 0 || date.getDay() === 6) {
                    return 'weekend';
                }
                if (CalendarUtils.isHoliday(date)) {
                    return "holiday";
                }
                if (date.getDate() == now.getDate() && date.getMonth() == now.getMonth() && date.getFullYear() == now.getFullYear()) {
                    return 'today';
                }
                return '';
            };
            gantt.templates.task_cell_class = function (item, date) {
                if (date.getDay() === 0 || date.getDay() === 6) {
                    return 'weekend';
                }
                if (CalendarUtils.isHoliday(date)) {
                    return "holiday";
                }
                if (date.getDate() == now.getDate() && date.getMonth() == now.getMonth() && date.getFullYear() == now.getFullYear()) {
                    return 'today';
                }
                return '';
            };
        },
        'month': function () {
            var now = new Date();
            gantt.config.scale_unit = "month";
            gantt.config.scale_height = 50;
            gantt.config.date_scale = "%F, %Y";
            gantt.config.subscales = [{
                unit: "week",
                step: 1,
                date: "w%W"
            }];
            gantt.templates.date_scale = null;
            gantt.templates.scale_cell_class = function (date) {
                if (date.getMonth() == now.getMonth() && date.getFullYear() == now.getFullYear()) {
                    if (date.getDate() == 1) {
                        return 'today';
                    }
                    if (getWeek(date) == getWeek(now)) {
                        return 'today';
                    }
                }
                return '';
            };
            gantt.templates.task_cell_class = function (item, date) {
                if (date.getMonth() == now.getMonth() && date.getFullYear() == now.getFullYear()) {
                    if (getWeek(date) == getWeek(now)) {
                        return 'today';
                    }
                }
                return '';
            };
        },
        'year': function () {
            var now = new Date();
            gantt.config.scale_unit = "year";
            gantt.config.scale_height = 50;
            gantt.config.step = 1;
            gantt.config.date_scale = "%Y";
            gantt.config.min_column_width = 50;
            gantt.config.subscales = [{
                unit: "month",
                step: 3,
                template: function (date) {
                    var dateToStr = gantt.date.date_to_str("%M");
                    var quarter = {
                        'Jan': '1',
                        'Apr': '2',
                        'Jul': '3',
                        'Oct': '4'
                    };
                    return quarter[dateToStr(date)] + 'Q';
                }
            }, {
                unit: "month",
                step: 1,
                date: "%M"
            }];
            gantt.templates.date_scale = null;
            gantt.templates.scale_cell_class = function (date) {
                if (date.getMonth() == now.getMonth() && date.getFullYear() == now.getFullYear()) {
                    if (date.getDate() == 1) {
                        return 'today';
                    }
                    if (getWeek(date) == getWeek(now)) {
                        return 'today';
                    }
                }
                return '';
            };
            gantt.templates.task_cell_class = function (item, date) {
                if (date.getMonth() == now.getMonth() && date.getFullYear() == now.getFullYear()) {
                    if (getWeek(date) == getWeek(now)) {
                        return 'today';
                    }
                }
                return '';
            };
        }
    };
    function setScale(aScale) {
        if (!aScale) {
            return;
        }
        console.log('setScale', aScale);
        var init = true;
        var handler = KScaleHandlers[aScale];
        if (handler) {
            handler(init);
        }
    }
    DhxGanttExt.setScale = setScale;
    var available_scales = ['day', 'week', 'month', 'year'];
    function getCurrentScaleIndex() {
        var scale_unit = gantt.config.scale_unit;
        return available_scales.indexOf(scale_unit);
        ;
    }
    function decreaseScale() {
        var index = getCurrentScaleIndex() - 1;
        console.log('decreaseScale', index);
        setScale(available_scales[index]);
    }
    function increaseScale() {
        var index = getCurrentScaleIndex() + 1;
        console.log('increaseScale', index);
        setScale(available_scales[index]);
    }
})(DhxGanttExt || (DhxGanttExt = {}));
angular.module('ganttly').directive('dhxGantt', function ($calendar) {
    var unitDay = 1000 * 60 * 60 * 24;
    var unitHour = 1000 * 60 * 60;
    function initContextMenu(contextMenu) {
        var outstanding_param = {};
        var menu = new dhtmlXMenuObject();
        menu.setIconsPath("bower_components/dhtmlxMenu/sample_images/");
        menu.renderAsContextMenu();
        menu.setSkin("dhx_terrace");
        //menu.loadXML("data/dhxmenu.xml");
        var cbMap = (function () {
            var _cbMap = {};
            return {
                addMap: function (id, cb) {
                    if (_cbMap[id]) {
                        throw "Id already exists";
                    }
                    _cbMap[id] = cb;
                },
                call: function (id, param) {
                    _cbMap[id](param);
                }
            };
        })();
        contextMenu.menuItems.forEach(function (menuItem, pos) {
            menu.addNewChild(null, pos, menuItem.id, menuItem.text);
            cbMap.addMap(menuItem.id, menuItem.cb);
            if (menuItem.child) {
                menuItem.child.forEach(function (child) {
                    menu.addNewChild(menuItem.id, pos, child.id, child.text);
                    cbMap.addMap(child.id, child.cb);
                });
            }
        });
        menu.attachEvent("onClick", function (id, zoneId, cas) {
            cbMap.call(id, outstanding_param);
        });
        var _is_tooltip_orig;
        menu.attachEvent("onShow", function () {
            gantt['_hide_tooltip']();
            _is_tooltip_orig = gantt['_is_tooltip'];
            gantt['_is_tooltip'] = function () {
                return true;
            };
        });
        menu.attachEvent("onHide", function () {
            gantt['_is_tooltip'] = _is_tooltip_orig;
        });
        gantt.attachEvent("onContextMenu", function (taskId, linkId, event) {
            var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft, y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            outstanding_param = {
                taskId: taskId,
                linkId: linkId,
                event: event
            };
            if (taskId) {
                menu.showContextMenu(x, y);
            }
            else if (linkId) {
                menu.showContextMenu(x, y);
            }
            if (taskId || linkId) {
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
            DhxGanttExt.init($element);
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
            $scope.$watch($attrs['dhxScale'], function (scale) {
                DhxGanttExt.setScale(scale);
            }, true);
            var tooltip_handler = $scope[$attrs['dhxToolTip']];
            gantt.templates.tooltip_text = tooltip_handler || function () {
            };
            var taskChangeMode;
            var moveStartDate;
            var eventAttachIds = [
                gantt.attachEvent("onTaskClick", function (id, e) {
                    var taskClickWithShift = e ? e.shiftKey : false;
                    if ($attrs['dhxTaskShiftClicked'] && taskClickWithShift) {
                        $scope[$attrs['dhxTaskShiftClicked']](gantt, id);
                        return false;
                    }
                    return true;
                }),
                gantt.attachEvent("onTaskSelected", function (id, item) {
                    if ($attrs['dhxTaskSelected']) {
                        $scope[$attrs['dhxTaskSelected']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onTaskDblClick", function (id, event) {
                    if ($attrs['dhxTaskDblClick']) {
                        $scope[$attrs['dhxTaskDblClick']](gantt, id, event);
                    }
                }),
                gantt.attachEvent("onAfterTaskAdd", function (id, item) {
                    if ($attrs['dhxTaskAdd']) {
                        $scope[$attrs['dhxTaskAdd']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onBeforeTaskChanged", function (id, mode, task) {
                    //                    console.log('onBeforeTaskChanged: ' + mode + ', ' + task.start_date);
                    if (mode === "move") {
                        moveStartDate = task.start_date;
                    }
                    taskChangeMode = mode;
                    return true;
                }),
                gantt.attachEvent("onAfterTaskUpdate", function (id, item) {
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
                gantt.attachEvent("onAfterTaskDelete", function (id, item) {
                    if ($attrs['dhxTaskDelete']) {
                        $scope[$attrs['dhxTaskDelete']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onTaskOpened", function (id) {
                    if ($attrs['dhxTaskOpened']) {
                        $scope[$attrs['dhxTaskOpened']](gantt, id);
                    }
                }),
                gantt.attachEvent("onTaskClosed", function (id) {
                    if ($attrs['dhxTaskClosed']) {
                        $scope[$attrs['dhxTaskClosed']](gantt, id);
                    }
                }),
                gantt.attachEvent("onAfterLinkAdd", function (id, item) {
                    if ($attrs['dhxLinkAdd']) {
                        $scope[$attrs['dhxLinkAdd']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkUpdate", function (id, item) {
                    if ($attrs['dhxLinkUpdate']) {
                        $scope[$attrs['dhxLinkUpdate']](gantt, id, item);
                    }
                }),
                gantt.attachEvent("onAfterLinkDelete", function (id, item) {
                    if ($attrs['dhxLinkDelete']) {
                        $scope[$attrs['dhxLinkDelete']](gantt, id, item);
                    }
                })
            ];
            $scope.$on('$destroy', function () {
                eventAttachIds.forEach(function (id) {
                    gantt.detachEvent(id);
                });
            });
            if ($attrs['dhxContextMenu'] && $scope[$attrs['dhxContextMenu']]) {
                initContextMenu($scope[$attrs['dhxContextMenu']]);
            }
        }
    };
});
//# sourceMappingURL=dhxGantt.js.map