/// <reference path="../../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="../../directive/dhxForm/dhxForm.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../lib/DhxExt.ts"/>
/// <reference path="../../lib/UiUtils.ts"/>
angular.module('ganttly').controller('GanttCbUserCtrl', function ($scope, $state, $stateParams) {
    console.log($stateParams);

    var unitDay = 1000 * 60 * 60 * 24;
    var unitHour = 1000 * 60 * 60;
    var unitWorkingDay = gConfig.workingHours ? gConfig.workingHours * unitHour : unitDay;
    var holidayAwareness = gConfig.holidayAwareness;

    var paramUser = $stateParams.user;
    var paramScale = $stateParams.scale || 'week';
    var paramSort = $stateParams.sorting || 'short_by_none';
    var paramGroupings = $stateParams.groupings ? $stateParams.groupings.split(',') : [];
    var paramFilters = $stateParams.filters ? $stateParams.filters.split(',') : [];

    var taskTrackerUriList;

    var KUiRouterName = 'ganttCbUser';

    var context = new UiUtils.CAngularContext($scope);

    /**
    * User selections
    */
    UiUtils.UserHelper.create(context, document.getElementById('cbUser'), paramUser, function (id) {
        $state.go(KUiRouterName, {
            user: id
        }, {
            inherit: true
        });
    });

    /**
    * Sorting
    */
    UiUtils.SortHelper.createCombo(context, document.getElementById('cbSort'), paramSort, function (id) {
        $state.go(KUiRouterName, {
            sort: id
        }, {
            inherit: true
        });
    });

    /**
    * Groupings
    *
    */
    var elements = [document.getElementById('cbGroup1'), document.getElementById('cbGroup2')];
    UiUtils.GroupHelper.createComboForProject(context, elements, paramGroupings, function (selections) {
        $state.go(KUiRouterName, {
            groupings: selections.join(',')
        }, {
            inherit: true
        });
    });

    /**
    * Scales
    */
    UiUtils.ScaleHelper.createCombo(context, document.getElementById('idScale'), paramScale, function (id) {
        $state.go(KUiRouterName, {
            scale: id
        }, {
            inherit: true
        });
    });

    /**
    * Filter options
    */
    UiUtils.FilterHelper.create(context, document.getElementById('idFilters'), paramFilters, function (filters) {
        $state.go(KUiRouterName, {
            filters: filters.join(',')
        }, {
            inherit: true
        });
    });

    /**
    * Navigation button
    */
    var frmNavi = [{
            name: 'bt_navi_today',
            type: 'button',
            value: 'Today',
            eventHandlers: {
                onButtonClick: function () {
                    //                console.error('onButtonClick');
                    //                gantt.scrollTo(gantt.posFromDate(CbUtils.UiUtils.getPast7DateFromNow()), 0);
                    //                gantt.showDate(new Date());
                    DhxGanttExt.setDateCentered(new Date());
                }
            }
        }];
    $scope.frmNavi = frmNavi;

    $scope.tooltip = function (start, end, task) {
        var ret = '';
        ret += '<p><b>' + task.text + '</b></p>';
        ret += '<hr>';

        if (task._warnings) {
            task._warnings.forEach(function (w) {
                ret += '<p class="warning">' + w + '</p>';
            });
        }

        ret += '<p>' + DhxGanttExt.formatDate(start) + ' - ' + DhxGanttExt.formatDate(end) + ' (' + task.duration + ')</p>';

        //        var descriptions = [
        //                "<b>Est. Days:</b> " + (task.estimatedDays || 0),
        //                "<b>Progress:</b> " + (task.progress ? task.progress.toFixed(2) : 0)
        //        ];
        //
        //        ret += descriptions.join('<br/>');
        //        if (task._data) {
        //            if (task._data.description) {
        //                ret += '<p>' + task._data.description + '</p>';
        //            }
        //        }
        return ret;
    };

    /**
    *
    * @type {{show: (function(any, any): undefined)}}
    */
    var contextWin = (function () {
        var wins = {};
        setInterval(function () {
            var key, winInfo;
            for (key in wins) {
                winInfo = wins[key];
                if (!winInfo.win.closed) {
                    if (!winInfo.geo || winInfo.geo.x !== winInfo.win.screenX || winInfo.geo.y !== winInfo.win.screenY || winInfo.geo.width !== winInfo.win.outerWidth || winInfo.geo.height !== winInfo.win.outerHeight) {
                        winInfo.geo = {
                            x: winInfo.win.screenX,
                            y: winInfo.win.screenY,
                            width: winInfo.win.outerWidth,
                            height: winInfo.win.outerHeight
                        };

                        //                        console.log(winInfo.geo);
                        window.localStorage.setItem('contextWin.' + key, JSON.stringify(winInfo.geo));
                    }
                }
            }
        }, 250);

        return {
            show: function (aName, aUrl) {
                //                console.log('contextWin.show: [' + aName + ']' + aUrl);
                if (wins[aName] && !wins[aName].win.closed) {
                    wins[aName].win.location.href = 'about:blank';
                    wins[aName].win.location.href = aUrl;
                } else {
                    var prevGeo;
                    try  {
                        prevGeo = JSON.parse(window.localStorage.getItem('contextWin.' + aName));
                    } catch (e) {
                    }
                    var width = 1280;
                    var height = 720;
                    var x = (screen.width - width) / 2;
                    var y = (screen.height - height) / 2;
                    if (prevGeo) {
                        width = prevGeo.width;
                        height = prevGeo.height;
                        x = prevGeo.x;
                        y = prevGeo.y;
                    }
                    var params = [
                        'width=' + width,
                        'height=' + height,
                        'fullscreen=yes'
                    ].join(',');
                    var win = open(aUrl, null, params);
                    win.moveTo(x, y);
                    win.resizeTo(width, height);
                    wins[aName] = {
                        win: win
                    };
                }
            }
        };
    }());

    function get_holiday_awared_task(aTask, aMode) {
        var holidayAwared = holidayAwareness ? CalendarUtils.getStartAndEndDate(aTask.start_date, aTask.estimatedMillis) : {
            start: aTask.start_date,
            end: aTask.end_date
        };

        var task = {
            uri: aTask.id,
            name: aTask.text,
            startDate: holidayAwared.start
        };
        if (aMode === 'resize') {
            task.endDate = aTask.end_date;
        } else if (aMode === 'move') {
            task.endDate = holidayAwared.end;
        } else if (aMode === 'progress') {
        } else {
            task.estimatedMillis = aTask.duration * unitWorkingDay;
            if (holidayAwareness) {
                task.endDate = CalendarUtils.getStartAndEndDate(aTask.start_date, aTask.duration * unitWorkingDay).end;
            } else {
                task.endDate = holidayAwared.end;
            }
        }
        if (aTask.progress) {
            task.spentMillis = Math.round(aTask.estimatedMillis * aTask.progress);
        }
        return task;
    }

    /**
    * Task Add
    * @param gantt
    * @param id
    * @param item
    */
    $scope.onTaskAdd = function (gantt, id, item) {
        if (taskTrackerUriList) {
            //            var param: cb.TParamCreateTask = {
            //                tracker: taskTrackerUriList[0],
            //                name: item.text,
            //                startDate: item.start_date,
            //                estimatedMillis: item.duration * unitWorkingDay,
            //                description: item.text + '\n\nCreated by ganttly',
            //                descFormat: "Wiki"
            //            };
            //            if (item.parent) {
            //                param.parent = item.parent;
            //            }
            UiUtils.ModalHelper.showModal("Adding task");
            //            $codeBeamer.createTask(param, function (err, resp) {
            //                if (err) {
            //                    console.log(err);
            //                    return;
            //                }
            ////                gantt.changeTaskId(id, resp.uri);
            //                var task = CbUtils.covertCbTaskToDhxTask(resp, item.parent);
            //                $scope.tasks.data.unshift(task);
            //                gantt.clearAll();
            //                gantt.parse($scope.tasks, "json");
            //                closeModal();
            //            });
        }
    };

    $scope.onTaskDblClick = function (gantt, taskId, event) {
        var url = taskId;
        var width = 1280;
        var height = 720;
        var params = [
            'width=' + width,
            'height=' + height,
            'fullscreen=yes'
        ].join(',');
        var win = open(gConfig.cbBaseUrl + url, null, params);
        win.moveTo((screen.width - width) / 2, (screen.height - height) / 2);
        win.resizeTo(width, height);
    };

    $scope.onTaskShiftClicked = function (gantt, id) {
        var match = /\/(\d+)$/.exec(id);
        if (match) {
            contextWin.show('task_details', gConfig.cbBaseUrl + id);
            contextWin.show('task_relations', gConfig.cbBaseUrl + '/proj/tracker/itemDependencyGraph.spr?task_id=' + match[1]);
        }
    };

    $scope.onTaskUpdate = function (id, item, mode) {
        var task = get_holiday_awared_task(item, mode);
        UiUtils.ModalHelper.showModal("Updating task");
        //        $codeBeamer.updateTask(task, function(err, resp) {
        //            if (err) {
        //                console.log(err);
        //                return;
        //            }
        //            var task = covertCbTaskToDhxTask(resp, item.parent);
        //            item.start_date = task.start_date;
        //            item.estimatedMillis = task.estimatedMillis;
        //            item.progress = task.progress;
        //            item.end_date = task.end_date;
        //            gantt.refreshTask(item.id);
        ////            gantt.refreshData();
        ////            gantt.selectTask(task.id);
        //            closeModal();
        //        });
    };

    $scope.onTaskDelete = function (gantt, id, item) {
        console.log('onTaskDelete');
        var i, len = $scope.tasks.data.length, task;
        for (i = 0; i < len; i++) {
            task = $scope.tasks.data[i];
            if (task.id === id) {
                $scope.tasks.data.splice(i, 1);
                break;
            }
        }
        //        $codeBeamer.deleteTask(id, function(err) {
        //            if (err) {
        //                console.log(err);
        //                return;
        //            }
        //            gantt.refreshData();
        //        });
    };

    $scope.onTaskOpened = function (gantt, id) {
        var task = gantt.getTask(id);
        if (task) {
            task.open = true;
        }
        return true;
    };

    $scope.onTaskClosed = function (gantt, id) {
        var task = gantt.getTask(id);
        if (task) {
            task.open = false;
        }
        return true;
    };

    /**
    * Link add
    * @param id
    * @param item
    */
    function adjustStartTime(gantt, toId, fromId) {
        var taskTo = gantt.getTask(toId);
        var taskFrom = gantt.getTask(fromId);
        if (taskTo.duration) {
            taskFrom.start_date = new Date(taskTo.start_date.getTime() + taskTo.duration * unitDay);
            taskFrom.end_date = new Date(taskFrom.start_date.getTime() + taskFrom.duration * unitDay);
            gantt.updateTask(fromId);
            $scope.tasks.links.forEach(function (link) {
                if (link.source === fromId) {
                    adjustStartTime(gantt, fromId, link.target);
                }
            });
        }
    }

    $scope.onLinkAdd = function (gantt, id, item) {
        console.log(id, item);
        if (item.type === '0') {
            UiUtils.ModalHelper.showModal("Adding association");
            //            $codeBeamer.createAssociation({
            //                from: item.target,
            //                to: item.source
            //            }, function(err, association) {
            //                if (err) {
            //                    return;
            //                }
            //                $scope.tasks.links.push({
            //                    id: association.uri,
            //                    source: item.source,
            //                    target: item.target,
            //                    type: '0'
            //                });
            ////                adjustStartTime(gantt, item.source, item.target);
            //                gantt.refreshData();
            //                closeModal();
            //            });
        } else {
            gantt.deleteLink(id);
            dhtmlx.message('의존 관계만 설정할 수 있습니다.');
        }
    };

    $scope.onLinkUpdate = function (gantt, id, item) {
        console.log(id);
        console.log(item);
    };

    $scope.onLinkDelete = function (gantt, id, item) {
        //        $codeBeamer.deleteAssociation(id, function(err, resp) {
        //
        //        });
    };

    /**
    * Context menu
    * @type {{menuItems: {id: string, text: string, cb: (function(dhx.TContextCbParam): undefined)}[]}}
    */
    var contextMenu = {
        menuItems: [
            {
                id: 'open_task',
                text: '새창에서 열기',
                cb: function (param) {
                    var url = param.taskId || param.linkId;
                    var width = 1280;
                    var height = 720;
                    var params = [
                        'width=' + width,
                        'height=' + height,
                        'fullscreen=yes'
                    ].join(',');
                    var win = open(gConfig.cbBaseUrl + url, null, params);
                    win.moveTo((screen.width - width) / 2, (screen.height - height) / 2);
                    win.resizeTo(width, height);
                }
            }
        ]
    };

    //    $scope.contextMenu = contextMenu;
    if (!paramUser) {
        try  {
            gantt.clearAll();
        } catch (e) {
        }
        return;
    }

    /**
    * Display Tasks
    * @type {{}}
    */
    UiUtils.ModalHelper.showModal('Getting information...');

    var groupings = UiUtils.GroupHelper.getGroupings(paramGroupings);
    var filters = UiUtils.FilterHelper.getFilterType(paramFilters);
    var sorting = UiUtils.SortHelper.getSortType(paramSort);

    UiUtils.getDhxDataByProject(paramUser, groupings, filters, sorting, function (err, resp, markers) {
        var prev_date = DhxGanttExt.getCenteredDate();

        // draw gantt chart
        DhxGanttExt.setScale(paramScale);

        gantt.clearAll();

        gantt.parse(resp, "json");

        setTimeout(function () {
            DhxGanttExt.setDateCentered(prev_date || new Date());
        }, 5);

        // close modal
        UiUtils.ModalHelper.closeModal();
    });

    console.log('-------------------------');
});
//# sourceMappingURL=ganttCbUser.js.map
