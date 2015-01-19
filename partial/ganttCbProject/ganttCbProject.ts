
/// <reference path="../../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="../../directive/dhxForm/dhxForm.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>
/// <reference path="../../lib/CodeBeamer.ts"/>

declare var dhtmlXWindows;

angular.module('ganttly').controller('GanttCbProjectCtrl', function (
    $scope, $state, $stateParams, $calendar, $codeBeamer: cb.ICodeBeamer) {

    console.log($stateParams);

    var unitDay = 1000 * 60 * 60 * 24;
    var unitHour = 1000 * 60 * 60;
    var unitWorkingDay = gConfig.workingHours ? gConfig.workingHours * unitHour: unitDay;
    var holidayAwareness = gConfig.holidayAwareness;

    var userUri = $stateParams.user;
    var projectUri = $stateParams.project;
    var groupByUser = $stateParams.groupByUser === 'true';
    var groupByProject = $stateParams.groupByProject === 'true';
    var taskTrackerUriList: string[];


    /**
     * Project selections
     *
     */

    function getProjectList(text, cb) {
        Cb.project.getPage(1, text, function(err, projectsPage) {
            if (err) {
                return;
            }

            var items = [];
            projectsPage.projects.forEach(function(project) {
                items.push({
                    id: project.uri,
                    text: project.name
                });
            });
            cb(items);
        });
    }

    $scope.cbProjectItems = [];
    $scope.cbProjectFilter = function(text, cb) {
        getProjectList(text, cb);
    };
    getProjectList('', function(items) {
        $scope.cbProjectItems = items;
        $scope.$apply();
    });

    $scope.setProject = function(uri) {
        if (uri === projectUri) {
            return;
        }
        console.log('****** project');
        $state.go('ganttCbProject', {
            project: uri
        }, {
            inherit: false
        });
    };

    /**
     * Grouings
     *
     */

    $scope.cbGrouping = [{
        id: 'group_by_user',
        text: 'By user'
    }, {
        id: 'group_by_project',
        text: 'By project'
    }, {
        id: 'group_by_release',
        text: 'By release'
    }];
    $scope.cbGrouping1st = '';
    var groupTypeById = {
        'group_by_user': CbUtils.TGroupType.ByUser,
        'group_by_project': CbUtils.TGroupType.ByProject,
        'group_by_release': CbUtils.TGroupType.BySprint
    };
    var group1st;
    $scope.setGrouping1st = function(selected) {
        console.log('setGrouping1St: ' + selected);
        var groupType = groupTypeById[selected];
        group1st = groupType;
        CbUtils.UiUtils.getDhxDataByProject(projectUri, [groupType], function(err, resp) {
            gantt.clearAll();
            gantt.parse(resp, "json");
        });
    };
    $scope.cbGrouping2nd = '';
    $scope.setGrouping2nd = function(selected) {
        console.log('setGrouping2nd: ' + selected);
        var groupType = groupTypeById[selected];
        CbUtils.UiUtils.getDhxDataByProject(projectUri, [group1st, groupType], function(err, resp) {
            gantt.clearAll();
            gantt.parse(resp, "json");
        });
    };

    /**
     * Scales
     */
    $scope.cbScaleItems = [{
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
    $scope.scale = 'Week';

    /**
     *
     */

    var hdxWins = new dhtmlXWindows();
    hdxWins.attachViewportTo('ganttCbProject');
    var dialog;
    function showModal(aMessage: string) {
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
        dialog.attachHTMLString('<p>' + aMessage +'</p>');
        dialog.show();
    }
    function closeModal() {
        dialog.close();
    }

    var contextWin: any = (function() {

        var wins = {};
        setInterval(function() {
            var key, winInfo;
            for (key in wins) {
                winInfo = wins[key];
                if (!winInfo.win.closed) {
                    if (!winInfo.geo ||
                        winInfo.geo.x !== winInfo.win.screenX ||
                        winInfo.geo.y !== winInfo.win.screenY ||
                        winInfo.geo.width !== winInfo.win.outerWidth ||
                        winInfo.geo.height !== winInfo.win.outerHeight) {
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
            show: function(aName, aUrl) {
//                console.log('contextWin.show: [' + aName + ']' + aUrl);
                if (wins[aName] && !wins[aName].win.closed) {
                    wins[aName].win.location.href = 'about:blank';
                    wins[aName].win.location.href = aUrl;
                } else {
                    var prevGeo;
                    try {
                        prevGeo = JSON.parse(window.localStorage.getItem('contextWin.' + aName));
                    } catch (e) {
                    }
                    var width = 1280;
                    var height = 720;
                    var x = (screen.width - width)/2;
                    var y = (screen.height - height)/2;
                    if (prevGeo) {
                        width = prevGeo.width;
                        height = prevGeo.height;
                        x = prevGeo.x;
                        y = prevGeo.y;
                    }
                    var params = [
                            'width=' + width,
                            'height=' + height,
                        'fullscreen=yes' // only works in IE, but here for completeness
                    ].join(',');
                    var win: Window = open(aUrl, null, params);
                    win.moveTo(x, y);
                    win.resizeTo(width, height);
                    wins[aName] = {
                        win: win
                    };
                }
            }
        };
    }());

    function get_holiday_awared_task(aTask: DhxGantt.TTask, aMode: string): cb.TTask {
        var holidayAwared = holidayAwareness? $calendar.getStartAndEndDate(aTask.start_date, aTask.estimatedMillis): {
            start: aTask.start_date,
            end: aTask.end_date
        };

        var task: any = {
            uri: aTask.id,
            name: aTask.text,
            startDate: holidayAwared.start
        };
        if (aMode === 'resize') { // by dragging end date only changes end date
            task.endDate = aTask.end_date;
        } else if (aMode === 'move') { // by dragging task bar, apply holiday awareness by estimatedMillis
            task.endDate = holidayAwared.end;
        } else if (aMode === 'progress') { // by dragging progress bar, do nothing
        } else { // by duration change in light box, apply holiday awareness
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
    $scope.onTaskAdd = function(gantt, id, item: DhxGantt.TTask) {
        if (taskTrackerUriList) {
            var param: cb.TParamCreateTask = {
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

    $scope.onTaskShiftClicked = function(gantt, id) {
        var match = /\/(\d+)$/.exec(id);
        if (match) {
            contextWin.show('task_details', gConfig.cbBaseUrl + id);
            contextWin.show('task_relations', gConfig.cbBaseUrl + '/proj/tracker/itemDependencyGraph.spr?task_id=' + match[1]);
        }
    };

    $scope.onTaskUpdate = function(id, item: DhxGantt.TTask, mode: string) {
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

    $scope.onTaskDelete = function(gantt, id, item) {
        console.log('onTaskDelete');
        var i, len=$scope.tasks.data.length, task: DhxGantt.TTask;
        for (i=0; i<len; i++) {
            task = $scope.tasks.data[i];
            if (task.id === id) {
                $scope.tasks.data.splice(i, 1);
                break;
            }
        }
        $codeBeamer.deleteTask(id, function(err) {
            if (err) {
                console.log(err);
                return;
            }
            gantt.refreshData();
        });
    };

    $scope.onTaskOpened = function(gantt, id) {
        var task = gantt.getTask(id);
        if (task) {
            task.open = true;
        }
        return true;
    };

    $scope.onTaskClosed = function(gantt, id) {
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
        var taskTo: DhxGantt.TTask = gantt.getTask(toId);
        var taskFrom: DhxGantt.TTask = gantt.getTask(fromId);
        if (taskTo.duration) {
            taskFrom.start_date = new Date(taskTo.start_date.getTime() + taskTo.duration * unitDay);
            taskFrom.end_date = new Date(taskFrom.start_date.getTime() + taskFrom.duration * unitDay);
            gantt.updateTask(fromId);
            $scope.tasks.links.forEach(function(link) {
                if (link.source === fromId) {
                    adjustStartTime(gantt, fromId, link.target);
                }
            });
        }
    }

    $scope.onLinkAdd = function(gantt, id, item: DhxGantt.TLink) {
        console.log(id, item);
        if (item.type === '0') {

            showModal("Adding association");
            $codeBeamer.createAssociation({
                from: item.target,
                to: item.source
            }, function(err, association) {
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

    $scope.onLinkUpdate = function(gantt, id, item) {
        console.log(id);
        console.log(item);
    };

    $scope.onLinkDelete = function(gantt, id, item) {
        $codeBeamer.deleteAssociation(id, function(err, resp) {

        });
    };

    /**
     * Context menu
     * @type {{menuItems: {id: string, text: string, cb: (function(dhx.TContextCbParam): undefined)}[]}}
     */
    var contextMenu: DhxGantt.TContextMenu = {
        menuItems: [{
            id: 'open_task',
            text: '새창에서 열기',
            cb: function(param: DhxGantt.TContextCbParam) {
                var url = param.taskId || param.linkId;
                var width = 1280;
                var height = 720;
                var params = [
                    'width=' + width,
                    'height=' + height,
                    'fullscreen=yes' // only works in IE, but here for completeness
                ].join(',');
                var win = open(gConfig.cbBaseUrl + url, null, params);
                win.moveTo((screen.width - width)/2, (screen.height - height)/2);
                win.resizeTo(width, height);
            }
        }, /*{
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
        },*/ {
            id: 'open_user_view',
            text: '사용자 작업 보기',
            cb: function(param: DhxGantt.TContextCbParam) {

//                var task = gantt.getTask(param.taskId);
//                console.log(task);
//                console.log(location);

                if (param.taskId.indexOf('/user') === 0) {
                    var width = 1280;
                    var height = 720;
                    var params = [
                            'width=' + width,
                            'height=' + height,
                        'fullscreen=yes' // only works in IE, but here for completeness
                    ].join(',');

                    var win = open(location['origin'] + location.pathname + '/#/ganttCbProject?user=' + param.taskId, null, params);
                    win.moveTo((screen.width - width)/2, (screen.height - height)/2);
                    win.resizeTo(width, height);
                }
            }
        }]
    };

    $scope.contextMenu = contextMenu;

//    $codeBeamer.getUserList({
//        page: 1
//    }, function(err, resp) {
//        if (err) {
//            return;
//        }
//        $scope.userList = resp.users;
//
//        if (userUri) {
//            $scope.userList.forEach(function(user: cb.TUser) {
//                if (user.uri === userUri) {
//                    $scope.selectedUser = user.name;
//                }
//            });
//        }
//    });

    if (!userUri && !projectUri) {
        return;
    }

    /**
     * Display Tasks
     * @type {{}}
     */
    var param: cb.TParamGetTask = {};
    if (projectUri) {
        param.projectUri = projectUri;
        $codeBeamer.getByUri(projectUri, function(err, resp) {
            if (err) {
                return;
            }
            $scope.cbProjectItems = [{
                id: resp.uri,
                text: resp.name
            }];
            $scope.cbProjectSelected = resp.uri;
//            $scope.$apply();
        });

//        $codeBeamer.getReleases({
//            projectUri: projectUri
//        }, function(err, trackerUriList, resp) {
//            if (err) {
//                return;
//            }
//            resp.forEach(function(release) {
//                console.log(release.name);
//                var date = release.plannedReleaseDate ? new Date(release.plannedReleaseDate): new Date(release.modifiedAt);
//                var date_to_str = gantt.date.date_to_str(gantt.config.task_date);
//                gantt.addMarker({
//                    start_date: date,
//                    css: "release",
//                    title: date_to_str(date),
//                    text: release.name
//                });
//            });
//        });
    }

    showModal('Getting information...');

    CbUtils.UiUtils.getDhxDataByProject(projectUri, [], function(err, resp, markers) {
        gantt.clearAll();
        markers.forEach(function(m) {
            gantt.addMarker(m);
        });
        gantt.parse(resp, "json");

        closeModal();
    });


    return;
    $codeBeamer.getTasks(param, function(err, trackerUriList: string[], items: cb.TTask[]) {
        if (err) {
            console.log(err);
            return;
        }

        taskTrackerUriList = trackerUriList;

        var taskUris = [], tasks: DhxGantt.TTask[] = [], links: DhxGantt.TLink[] = [];
        var projects = {};
        var assignedUser = {};

        items.forEach(function(item) {
            taskUris.push(item.uri);
//            tasks.push(CbUtils.covertCbTaskToDhxTask(item)); TODO:
            if (groupByProject) {
                projects[item.tracker.project.uri] = item.tracker.project;
            }
            if (groupByUser) {
                if (item.assignedTo && item.assignedTo.length) {
                    assignedUser[item.assignedTo[0].uri] = item.assignedTo[0];
                }
            }
        });

        items.forEach(function(item, i) {
            if (item.associations) {
                item.associations.forEach(function (association:cb.TAssociation) {
                    var indexTo = association.to ? taskUris.indexOf(association.to.uri): -1;
                    var indexFrom = association.from ? taskUris.indexOf(association.from.uri): -1;
                    if (indexTo !== -1) {
                        if (association.type.name === 'depends') {
                            links.push({
                                id: association.uri,
                                source: association.to.uri,
                                target: item.uri,
                                type: '0'
                            });
                            if (!tasks[indexTo].depends) {
                                tasks[indexTo].depends = [];
                            }
                            tasks[indexTo].depends.push(item.uri);
                        } else if (association.type.name === 'parent') {
                            console.log(association.from.uri + ' -> ' + association.to.uri);
                            tasks[indexTo].parent = association.from.uri;
                        } else if (indexFrom !== -1 && association.type.name === 'child') {
                            console.log(association.to.uri + ' -> ' + association.from.uri);
                            tasks[indexFrom].parent = association.to.uri;
                        }
                    }
                });
            }
            if (groupByProject) {
                tasks[i].parent = item.tracker.project.uri;
            } else if (groupByUser) {
                if (item.assignedTo && item.assignedTo.length) {
                    tasks[i].parent = item.assignedTo[0].uri;
                } else {
                    tasks[i].parent = '__not_assigned__';
                }
            } else if (item.parent) {
                tasks[i].parent = item.parent.uri;
            }
        });

        Object.keys(projects).forEach(function(key) {
            tasks.push({
                id: projects[key].uri,
                text: projects[key].name,
                user: '-'
            });
        });

        var assignedUserKeys = Object.keys(assignedUser);
        if (assignedUserKeys.length) {
            assignedUserKeys.forEach(function(key) {
                tasks.push({
                    id: assignedUser[key].uri,
                    text: assignedUser[key].name,
                    user: '-'
                });
            });
            tasks.push({
                id: '__not_assigned__',
                text: 'Not assigned',
                user: '-'
            });
        }

        $scope.tasks = {
            data: tasks,
            links: links
        };

        gantt.clearAll();
        gantt.parse($scope.tasks, "json");

        closeModal();
    }, function(msg) {
        dhtmlx.message(msg);
    });

    console.log('-------------------------');

});
