/// <reference path="Calendar.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var DhxExt;
(function (DhxExt) {
    function alert(aMessage, aCb) {
        dhtmlx.alert(aMessage, aCb);
    }
    DhxExt.alert = alert;
    function confirm(aMessage, aCb) {
        dhtmlx.confirm(aMessage, aCb);
    }
    DhxExt.confirm = confirm;
    function modalbox(aMessage, aCb) {
        dhtmlx.modalbox(aMessage, aCb);
    }
    DhxExt.modalbox = modalbox;
    function message(aText, aType, aExpire, aId) {
        dhtmlx.message(aText, aType, aExpire, aId);
    }
    DhxExt.message = message;
    function assert(aTest, aMessage) {
        dhtmlx.assert(aTest, aMessage);
    }
    DhxExt.assert = assert;
    function error(aMessage) {
        dhtmlx.message({ type: "error", text: aMessage, expire: 3000 });
    }
    DhxExt.error = error;
    var CComponent = (function () {
        function CComponent() {
            this._eventAttachIds = [];
        }
        CComponent.prototype._setComponent = function (aComponent) {
            this._component = aComponent;
        };
        CComponent.prototype._addEventId = function (aEventId) {
            this._eventAttachIds.push(aEventId);
        };
        CComponent.prototype._addEvent = function (aEventName, aEventCb) {
            this._addEventId(this._component.attachEvent(aEventName, aEventCb));
        };
        CComponent.prototype.destroy = function () {
            var _this = this;
            this._eventAttachIds.forEach(function (id) {
                _this._component.detachEvent(id);
            });
        };
        return CComponent;
    })();
    DhxExt.CComponent = CComponent;
    var CContext = (function () {
        function CContext() {
            this._components = [];
        }
        CContext.prototype.destroy = function () {
            this._components.forEach(function (c) {
                c.destroy();
            });
            delete this._components;
        };
        CContext.prototype.addComponent = function (aComponent) {
            this._components.push(aComponent);
        };
        return CContext;
    })();
    DhxExt.CContext = CContext;
    var CCombo = (function (_super) {
        __extends(CCombo, _super);
        function CCombo(aElement, aFilter) {
            var _this = this;
            _super.call(this);
            this._combo = new dhtmlXCombo({
                parent: aElement,
                filter_cache: aFilter ? true : false
            });
            this._setComponent(this._combo);
            if (aFilter) {
                this._combo.enableFilteringMode(true, "dummy");
                this._addEventId(this._combo.attachEvent("onDynXLS", function (text) {
                    aFilter(text, function (items) {
                        var options = [];
                        _this._combo.clearAll();
                        items.forEach(function (item) {
                            options.push([item.id, item.text]);
                        });
                        _this._combo.addOption(options);
                        _this._combo.openSelect();
                    });
                }));
            }
            this._addEventId(this._combo.attachEvent("onChange", function () {
                if (_this.onChange) {
                    _this.onChange(_this._combo.getSelectedValue());
                }
            }));
        }
        CCombo.prototype.setItems = function (aItems) {
            var _this = this;
            this._combo.clearAll();
            aItems.forEach(function (item) {
                _this._combo.addOption(item.id, item.text);
            });
        };
        CCombo.prototype.setDisable = function (aDisabled) {
            if (aDisabled) {
                this._combo.disable();
            }
            else {
                this._combo.enable();
            }
        };
        CCombo.prototype.selectItemById = function (aId) {
            if (aId) {
                this._combo.setComboValue(aId);
            }
        };
        CCombo.prototype.openSelect = function () {
            this._combo.openSelect();
        };
        return CCombo;
    })(CComponent);
    DhxExt.CCombo = CCombo;
    var CForm = (function (_super) {
        __extends(CForm, _super);
        function CForm(aEl, aItems) {
            var _this = this;
            _super.call(this);
            this._eventHandlers = {};
            this._form = new dhtmlXForm(aEl, aItems);
            this._setComponent(this._form);
            this._addEventHandler(aItems);
            this._addEventId(this._form.attachEvent("onChange", function (name, value, state) {
                if (_this._eventHandlers[name] && _this._eventHandlers[name]['onChange']) {
                    _this._eventHandlers[name]['onChange'](value, state);
                }
            }));
            this._addEventId(this._form.attachEvent("onButtonClick", function (name) {
                if (_this._eventHandlers[name] && _this._eventHandlers[name]['onButtonClick']) {
                    _this._eventHandlers[name]['onButtonClick']();
                }
            }));
        }
        CForm.prototype._addEventHandler = function (aFormItems) {
            var _this = this;
            aFormItems.forEach(function (formItem) {
                if (formItem.eventHandlers) {
                    _this._eventHandlers[formItem.name] = formItem.eventHandlers;
                    delete formItem.eventHandlers;
                }
                if (formItem.type === 'block') {
                    _this._addEventHandler(formItem.list);
                }
            });
        };
        return CForm;
    })(CComponent);
    DhxExt.CForm = CForm;
    var CContextMenu = (function (_super) {
        __extends(CContextMenu, _super);
        function CContextMenu() {
            var _this = this;
            _super.call(this);
            this._menu = new dhtmlXMenuObject();
            this._setComponent(this._menu);
            this._menu.setIconsPath("bower_components/dhtmlxMenu/sample_images/");
            this._menu.renderAsContextMenu();
            this._menu.setSkin("dhx_terrace");
            this._addEventId(this._menu.attachEvent('onClick', function (id, zoneId, cas) {
                if (_this._cbMap[id]) {
                    _this._cbMap[id](id, _this._contextParam);
                    _this._contextParam = null;
                }
            }));
            this._addEventId(this._menu.attachEvent('onShow', function () {
                if (_this.onShow) {
                    _this.onShow();
                }
            }));
            this._addEventId(this._menu.attachEvent('onHide', function () {
                if (_this.onHide) {
                    _this.onHide();
                }
            }));
        }
        CContextMenu.prototype.setMenu = function (aMenu) {
            var _this = this;
            this._cbMap = {};
            aMenu.menuItems.forEach(function (menuItem, pos) {
                _this._menu.addNewChild(null, pos, menuItem.id, menuItem.text);
                _this._cbMap[menuItem.id] = menuItem.onClick;
                if (menuItem.child) {
                    menuItem.child.forEach(function (child) {
                        _this._menu.addNewChild(menuItem.id, pos, child.id, child.text);
                        _this._cbMap[child.id] = child.onClick;
                    });
                }
            });
        };
        CContextMenu.prototype.showContextMenu = function (aX, aY, aParam) {
            this._contextParam = aParam;
            this._menu.showContextMenu(aX, aY);
        };
        return CContextMenu;
    })(CComponent);
    DhxExt.CContextMenu = CContextMenu;
    /**************************************************************************
     * Gantt
     */
    var Gantt;
    (function (Gantt) {
        (function (TTaskType) {
            TTaskType[TTaskType["None"] = 0] = "None";
            TTaskType[TTaskType["User"] = 1] = "User";
            TTaskType[TTaskType["Project"] = 2] = "Project";
            TTaskType[TTaskType["Release"] = 3] = "Release";
        })(Gantt.TTaskType || (Gantt.TTaskType = {}));
        var TTaskType = Gantt.TTaskType;
        var KClassPriority = {
            'Highest': 'priority_highest',
            'High': 'priority_high',
            'Normal': 'priority_normal',
            'Low': 'priority_low',
            'Lowest': 'priority_lowest'
        };
        var KClassStatus = {
            //            'None': 'status_none',
            //            'New': 'status_new',
            //            'Suspended': 'status_suspended',
            //            'In progress': 'status_in_progress',
            //            'Partly completed': 'status_partly_completed',
            'Completed': 'status_completed',
            'Closed': 'status_completed'
        };
        var date_to_str = gantt.date.date_to_str('%Y.%m.%d');
        function formatDate(date) {
            return date_to_str(date);
        }
        Gantt.formatDate = formatDate;
        function init(aEl, aReadOnly) {
            function columnTaskRender(task) {
                var classNames = [];
                //            if (classes_priority[task.priority]) {
                //                classNames.push(classes_priority[task.priority]);
                //            }
                if (KClassStatus[task._status]) {
                    classNames.push(KClassStatus[task._status]);
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
            gantt.config.row_height = 22;
            gantt.config.readonly = aReadOnly;
            gantt.config.initial_scroll = false;
            gantt.config['preserve_scroll'] = true;
            // Autosize
            //        gantt.config.autosize = true;
            // Task class
            gantt.templates.task_class = function (start, end, task) {
                return KClassStatus[task._status] || '';
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
            gantt.init(aEl);
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
        Gantt.init = init;
        function setDateCentered(aDate) {
            var pos = gantt.posFromDate(aDate) - gantt.$task.offsetWidth / 2;
            gantt.scrollTo(pos, 0);
        }
        Gantt.setDateCentered = setDateCentered;
        function setParentOpen(aTask) {
            if (aTask.parent) {
                var parentTask = gantt.getTask(aTask.id);
                if (parentTask) {
                    parentTask.open = true;
                    setParentOpen(parentTask);
                }
            }
        }
        Gantt.setParentOpen = setParentOpen;
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
        Gantt.doDependsTasks = doDependsTasks;
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
        Gantt.getCenteredDate = getCenteredDate;
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
        Gantt.setScale = setScale;
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
        var CGanttContextMenu = (function (_super) {
            __extends(CGanttContextMenu, _super);
            function CGanttContextMenu(aGantt) {
                _super.call(this);
                this._gantt = aGantt;
                var _is_tooltip_orig;
                this.onShow = function () {
                    gantt['_hide_tooltip']();
                    _is_tooltip_orig = gantt['_is_tooltip'];
                    gantt['_is_tooltip'] = function () {
                        return true;
                    };
                };
                this.onHide = function () {
                    gantt['_is_tooltip'] = _is_tooltip_orig;
                };
            }
            CGanttContextMenu.prototype.show = function (aEvent, aTaskId, aLinkId) {
                if (!aTaskId && !aLinkId) {
                    return false;
                }
                var x = aEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                var y = aEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                this.showContextMenu(x, y, {
                    taskId: aTaskId,
                    linkId: aLinkId,
                    event: aEvent
                });
                return true;
            };
            return CGanttContextMenu;
        })(CContextMenu);
        var CGantt = (function (_super) {
            __extends(CGantt, _super);
            function CGantt(aEl, aReadOnly) {
                var _this = this;
                _super.call(this);
                init(aEl, aReadOnly);
                this._gantt = gantt;
                this._setComponent(this._gantt);
                if (aReadOnly) {
                    this._addReadOnlyEvent();
                }
                this._addEvent('onContextMenu', function (taskId, linkId, event) {
                    if (_this._contextMenu) {
                        _this._contextMenu.show(event, taskId, linkId);
                    }
                });
                this._addTaskEvents();
            }
            CGantt.prototype.destroy = function () {
                if (this._contextMenu) {
                    this._contextMenu.destroy();
                    this._contextMenu = null;
                }
            };
            CGantt.prototype._addReadOnlyEvent = function () {
                var _this = this;
                this._addEvent('onTaskDblClick', function (id, event) {
                    if (_this.onDblClicked) {
                        _this.onDblClicked(id, event);
                    }
                });
            };
            CGantt.prototype._addTaskEvents = function () {
                var _this = this;
                var taskChangeMode;
                var moveStartDate;
                var onBeforeLightbox;
                this._addEvent('onBeforeTaskAdd', function (taskId, task) {
                    if (_this.onBeforeTaskAdd) {
                        _this.onBeforeTaskAdd(taskId, task);
                    }
                });
                this._addEvent('onAfterTaskAdd', function (taskId, task) {
                    if (_this.onAfterTaskAdd) {
                        _this.onAfterTaskAdd(taskId, task);
                    }
                });
                this._addEvent('onBeforeTaskChanged', function (taskId, mode, task) {
                    if (mode == 'move') {
                        moveStartDate = task.start_date;
                    }
                    taskChangeMode = mode;
                    return true;
                });
                this._addEvent('onAfterTaskUpdate', function (id, task) {
                    if (onBeforeLightbox) {
                        return;
                    }
                    if (taskChangeMode == 'move' && moveStartDate.getTime() == task.start_date.getTime()) {
                    }
                    else if (_this.onAfterTaskUpdate) {
                        _this.onAfterTaskUpdate(id, task, taskChangeMode);
                    }
                    moveStartDate = null;
                    taskChangeMode = null;
                });
                this._addEvent('onAfterTaskDelete', function (id, task) {
                    if (_this.onAfterTaskDelete) {
                        _this.onAfterTaskDelete(id, task);
                    }
                });
                this._addEvent('onTaskOpened', function (id) {
                    if (_this.onTaskOpened) {
                        _this.onTaskOpened(id);
                    }
                });
                this._addEvent('onTaskClosed', function (id) {
                    if (_this.onTaskClosed) {
                        _this.onTaskClosed(id);
                    }
                });
                /* Light box */
                this._addEvent('onBeforeLightbox', function (taskId) {
                    onBeforeLightbox = true;
                    var task = _this._gantt.getTask(taskId);
                    if (!_this._isValidNewTask(taskId, task)) {
                        return false;
                    }
                    if (task.$new && _this.handleNewTaskAdded) {
                        return _this.handleNewTaskAdded(taskId, task);
                    }
                    onBeforeLightbox = false;
                    return true;
                });
            };
            CGantt.prototype.parse = function (aData) {
                this._gantt.parse(aData);
            };
            CGantt.prototype.clearAll = function () {
                this._gantt.clearAll();
            };
            CGantt.prototype.setToolTipProvider = function (aProvider) {
                this._gantt.templates.tooltip_text = aProvider;
            };
            CGantt.prototype.setContextMenu = function (aContextMenu) {
                this._contextMenu = new CGanttContextMenu(this._gantt);
                this._contextMenu.setMenu(aContextMenu);
            };
            CGantt.prototype._isValidNewTask = function (aTaskId, aTask) {
                if (this.doIsValidNewTask) {
                    return this.doIsValidNewTask(aTaskId, aTask);
                }
                return true;
            };
            return CGantt;
        })(CComponent);
        Gantt.CGantt = CGantt;
    })(Gantt = DhxExt.Gantt || (DhxExt.Gantt = {}));
})(DhxExt || (DhxExt = {}));
//# sourceMappingURL=DhxExt.js.map