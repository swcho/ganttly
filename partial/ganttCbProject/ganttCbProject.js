/// <reference path="../../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="../../directive/dhxForm/dhxForm.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>
/// <reference path="../../lib/CodeBeamer.ts"/>

angular.module('ganttly').controller('GanttCbProjectCtrl', function ($scope, $state, $stateParams, $calendar, $codeBeamer) {
    console.log($stateParams);

    var unitDay = 1000 * 60 * 60 * 24;
    var unitHour = 1000 * 60 * 60;
    var unitWorkingDay = gConfig.workingHours ? gConfig.workingHours * unitHour : unitDay;
    var holidayAwareness = gConfig.holidayAwareness;

    var paramProjectUri = $stateParams.project;
    var paramScope = $stateParams.scope || 'Week';
    var paramSorting = $stateParams.sorting || 'short_by_none';
    var paramGroupings = $stateParams.groupings ? $stateParams.groupings.split(',') : [];
    var paramFilters = $stateParams.filters ? $stateParams.filters.split(',') : [];

    var userUri = $stateParams.user;
    var groupByUser = $stateParams.groupByUser === 'true';
    var groupByProject = $stateParams.groupByProject === 'true';
    var taskTrackerUriList;

    /**
    * Project selections
    *
    */
    function getProjectList(text, cb) {
        Cb.project.getPage(1, text, function (err, projectsPage) {
            if (err) {
                return;
            }

            var items = [];
            projectsPage.projects.forEach(function (project) {
                items.push({
                    id: project.uri,
                    text: project.name
                });
            });
            cb(items);
        });
    }

    //    $scope.cbProjectItems = [];
    $scope.cbProjectFilter = function (text, cb) {
        getProjectList(text, cb);
    };

    if (!paramProjectUri) {
        getProjectList('', function (items) {
            $scope.cbProjectItems = items;
        });
    } else {
        Cb.project.getProject(paramProjectUri, function (err, p) {
            $scope.cbProjectItems = [{
                    id: p.uri,
                    text: p.name
                }];
            $scope.cbProjectSelected = p.uri;
            $scope.$apply();
        });
    }

    $scope.setProject = function (uri) {
        if (uri === paramProjectUri) {
            return;
        }
        $state.go('ganttCbProject', {
            project: uri
        }, {
            inherit: true
        });
    };

    /**
    * Sorting
    */
    var KSortIdNone = 'short_by_none';
    var KSortIdStartTimeAsc = 'short_by_start_date_asc';
    var KSortIdStartTimeDsc = 'short_by_start_date_dsc';
    var KSortIdEndTimeAsc = 'short_by_end_date_asc';
    var KSortIdEndTimeDsc = 'short_by_end_date_dsc';
    var KSortIdSubmittedTimeAsc = 'short_by_submitted_date_asc';
    var KSortIdSubmittedTimeDsc = 'short_by_submitted_date_dsc';
    var KSortIdModifiedTimeAsc = 'short_by_modified_date_asc';
    var KSortIdModifiedTimeDsc = 'short_by_modified_date_dsc';

    $scope.cbSort = [
        {
            id: KSortIdNone,
            text: 'None'
        }, {
            id: KSortIdStartTimeAsc,
            text: 'Start date \u25B2'
        }, {
            id: KSortIdStartTimeDsc,
            text: 'Start date \u25BC'
        }, {
            id: KSortIdEndTimeAsc,
            text: 'End date \u25B2'
        }, {
            id: KSortIdEndTimeDsc,
            text: 'End date \u25BC'
        }, {
            id: KSortIdSubmittedTimeAsc,
            text: 'Submitted date \u25B2'
        }, {
            id: KSortIdSubmittedTimeDsc,
            text: 'Submitted date \u25BC'
        }, {
            id: KSortIdModifiedTimeAsc,
            text: 'Modified date \u25B2'
        }, {
            id: KSortIdModifiedTimeDsc,
            text: 'Modified date \u25BC'
        }];
    $scope.cbSortSelected = paramSorting;
    $scope.cbSortChanged = function (selected) {
        $state.go('ganttCbProject', {
            sorting: selected
        }, {
            inherit: true
        });
    };

    /**
    * Groupings
    *
    */
    var cbGroupingData = [
        {
            id: 'group_by_none',
            text: 'None'
        }, {
            id: 'group_by_user',
            text: 'By user'
        }, {
            id: 'group_by_project',
            text: 'By project'
        }, {
            id: 'group_by_release',
            text: 'By release'
        }];

    $scope.cb1Data = cbGroupingData;
    console.log(paramGroupings);
    $scope.cb1Selected = paramGroupings.length ? paramGroupings[0] : 'group_by_none';
    $scope.cb1Disabled = paramProjectUri ? false : true;
    $scope.cb1SetGrouping = function (selected) {
        if (paramGroupings[0] != selected) {
            $state.go('ganttCbProject', {
                groupings: selected
            }, {
                inherit: true
            });
        }
    };

    var cb2Data = [];
    if (paramGroupings.length) {
        cbGroupingData.forEach(function (d) {
            if (paramGroupings[0] != d.id) {
                cb2Data.push(d);
            }
        });
    }
    $scope.cb2Data = cb2Data;
    $scope.cb2Selected = paramGroupings.length > 1 ? paramGroupings[1] : 'group_by_none';
    $scope.cb2Disabled = paramGroupings.length > 0 && paramGroupings[0] != 'group_by_none' ? false : true;
    $scope.cb2SetGrouping = function (selected) {
        if (paramGroupings[1] != selected) {
            paramGroupings[1] = selected;
            $state.go('ganttCbProject', {
                groupings: paramGroupings.join(',')
            }, {
                inherit: true
            });
        }
    };

    /**
    * Scales
    */
    $scope.cbScaleItems = [
        {
            id: 'Day',
            text: '일'
        }, {
            id: 'Week',
            text: '주'
        }, {
            id: 'Month',
            text: '월'
        }, {
            id: 'Year',
            text: '년'
        }];
    $scope.scale = paramScope;

    /**
    * Form options
    */
    var KFilterIdWithoutCompletedTask = 'fid_without_task';
    $scope.frmItems = [{
            name: KFilterIdWithoutCompletedTask,
            type: 'checkbox',
            label: 'Hide Completed Tasks',
            checked: paramFilters.indexOf(KFilterIdWithoutCompletedTask) != -1,
            eventHandlers: {
                onChange: function (value, state) {
                    var prevIndex = paramFilters.indexOf(KFilterIdWithoutCompletedTask);
                    var prevState = prevIndex != -1;
                    if (state != prevState) {
                        if (state) {
                            paramFilters.push(KFilterIdWithoutCompletedTask);
                        } else {
                            paramFilters.splice(prevIndex);
                        }
                        $state.go('ganttCbProject', {
                            filters: paramFilters.join(',')
                        }, {
                            inherit: true
                        });
                    }
                }
            }
        }];

    /**
    *
    */
    var hdxWins = new dhtmlXWindows();
    hdxWins.attachViewportTo('ganttCbProject');
    var dialog;
    function showModal(aMessage) {
        dialog = hdxWins.createWindow({
            id: 'progress',
            left: 20,
            top: 30,
            width: 300,
            height: 100,
            modal: true,
            center: true,
            header: false,
            caption: 'Please wait...'
        });
        dialog.setModal(true);
        dialog.progressOn();
        dialog.attachHTMLString('<p>' + aMessage + '</p>');
        dialog.show();
    }
    function closeModal() {
        dialog.close();
    }

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
        var holidayAwared = holidayAwareness ? $calendar.getStartAndEndDate(aTask.start_date, aTask.estimatedMillis) : {
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
                task.endDate = $calendar.getStartAndEndDate(aTask.start_date, aTask.duration * unitWorkingDay).end;
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
            var param = {
                tracker: taskTrackerUriList[0],
                name: item.text,
                startDate: item.start_date,
                estimatedMillis: item.duration * unitWorkingDay,
                description: item.text + '\n\nCreated by ganttly',
                descFormat: "Wiki"
            };
            if (item.parent) {
                param.parent = item.parent;
            }

            showModal("Adding task");
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

    $scope.onTaskShiftClicked = function (gantt, id) {
        var match = /\/(\d+)$/.exec(id);
        if (match) {
            contextWin.show('task_details', gConfig.cbBaseUrl + id);
            contextWin.show('task_relations', gConfig.cbBaseUrl + '/proj/tracker/itemDependencyGraph.spr?task_id=' + match[1]);
        }
    };

    $scope.onTaskUpdate = function (id, item, mode) {
        var task = get_holiday_awared_task(item, mode);
        showModal("Updating task");
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
        $codeBeamer.deleteTask(id, function (err) {
            if (err) {
                console.log(err);
                return;
            }
            gantt.refreshData();
        });
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
            showModal("Adding association");
            $codeBeamer.createAssociation({
                from: item.target,
                to: item.source
            }, function (err, association) {
                if (err) {
                    return;
                }
                $scope.tasks.links.push({
                    id: association.uri,
                    source: item.source,
                    target: item.target,
                    type: '0'
                });

                //                adjustStartTime(gantt, item.source, item.target);
                gantt.refreshData();
                closeModal();
            });
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
        $codeBeamer.deleteAssociation(id, function (err, resp) {
        });
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
            },
            {
                /*{
                id: 'adjust_schedule',
                text: '연관 작업 일정 조정',
                cb: function(param: dhx.TContextCbParam) {
                //                console.log(param);
                var task = gantt.getTask(param.taskId);
                showModal("Rescheduling tasks");
                doDependsTasks(task,
                function() {
                closeModal();
                },
                function(precedentTask: dhx.TTask, task: dhx.TTask, aCb) {
                task.start_date = precedentTask.end_date;
                var adjusted_task = get_holiday_awared_task(task, "move");
                $codeBeamer.updateTask(adjusted_task, function(err, resp) {
                if (!err) {
                var task_from_cb = covertCbTaskToDhxTask(resp, task.parent);
                task.start_date = task_from_cb.start_date;
                task.estimatedMillis = task_from_cb.estimatedMillis;
                task.progress = task_from_cb.progress;
                task.end_date = task_from_cb.end_date;
                gantt.refreshTask(task.id);
                }
                aCb(err);
                });
                }
                );
                }
                },*/
                id: 'open_user_view',
                text: '사용자 작업 보기',
                cb: function (param) {
                    //                var task = gantt.getTask(param.taskId);
                    //                console.log(task);
                    //                console.log(location);
                    if (param.taskId.indexOf('/user') === 0) {
                        var width = 1280;
                        var height = 720;
                        var params = [
                            'width=' + width,
                            'height=' + height,
                            'fullscreen=yes'
                        ].join(',');

                        var win = open(location['origin'] + location.pathname + '/#/ganttCbProject?user=' + param.taskId, null, params);
                        win.moveTo((screen.width - width) / 2, (screen.height - height) / 2);
                        win.resizeTo(width, height);
                    }
                }
            }]
    };

    $scope.contextMenu = contextMenu;

    if (!userUri && !paramProjectUri) {
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
    showModal('Getting information...');

    var groupTypeById = {
        'group_by_user': 1 /* ByUser */,
        'group_by_project': 2 /* ByProject */,
        'group_by_release': 3 /* BySprint */
    };
    var groupings = [];
    paramGroupings.forEach(function (groupingId) {
        if (groupTypeById[groupingId]) {
            groupings.push(groupTypeById[groupingId]);
        }
    });

    var filterTypeById = {};
    filterTypeById[KFilterIdWithoutCompletedTask] = 1 /* ByWithoutCompletedTask */;
    var filters = 0 /* None */;
    paramFilters.forEach(function (filterId) {
        filters = filters | filterTypeById[filterId];
    });

    var sortingTypeById = {
        'short_by_none': 0 /* None */,
        'short_by_start_date_asc': 1 /* ByStartTime */,
        'short_by_start_date_dsc': 2 /* ByStartTimeDsc */
    };
    sortingTypeById[KSortIdNone] = 0 /* None */;
    sortingTypeById[KSortIdStartTimeAsc] = 1 /* ByStartTime */;
    sortingTypeById[KSortIdStartTimeDsc] = 2 /* ByStartTimeDsc */;
    sortingTypeById[KSortIdEndTimeAsc] = 3 /* ByEndTime */;
    sortingTypeById[KSortIdEndTimeDsc] = 4 /* ByEndTimeDsc */;
    sortingTypeById[KSortIdSubmittedTimeAsc] = 5 /* BySubmittedTime */;
    sortingTypeById[KSortIdSubmittedTimeDsc] = 6 /* BySubmittedTimeDsc */;
    sortingTypeById[KSortIdModifiedTimeAsc] = 7 /* ByModifiedTime */;
    sortingTypeById[KSortIdModifiedTimeDsc] = 8 /* ByModifiedTimeDsc */;

    var sorting = sortingTypeById[paramSorting];

    CbUtils.UiUtils.getDhxDataByProject(paramProjectUri, groupings, filters, sorting, function (err, resp, markers) {
        var prevPosition = gantt.getScrollState();
        console.error(prevPosition);

        // set gantt chart
        gantt.clearAll();
        markers.forEach(function (m) {
            gantt.addMarker(m);
        });
        gantt.parse(resp, "json");

        setTimeout(function () {
            if (prevPosition.x == 0 && prevPosition.y == 0) {
                console.error('set 7 days before');
                prevPosition.x = gantt.posFromDate(CbUtils.UiUtils.getPast7DateFromNow());
                prevPosition.y = 0;
            }
            gantt.scrollTo(prevPosition.x, prevPosition.y);
        }, 0);

        // close modal
        closeModal();
    });

    console.log('-------------------------');
});
//# sourceMappingURL=ganttCbProject.js.map
