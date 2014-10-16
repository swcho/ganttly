
/// <reference path="../../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>

angular.module('ganttly').controller('GanttCbProjectCtrl', function ($scope, $state, $stateParams, $codeBeamer: cb.ICodeBeamer) {

    console.log($stateParams);

    var unitDay = 1000 * 60 * 60 * 24;

    var userUri = $stateParams.user;
    var projectUri = $stateParams.project;
    var taskTrackerUriList: string[];

    $scope.cbUserItems = [];
    $scope.cbUserFilter = function(text, cb) {
        console.log(text);
        $codeBeamer.getUserList({
            page: 1,
            filter: text
        }, function(err, resp) {
            if (err) {
                return;
            }

            var items = [];
            resp.users.forEach(function(user) {
                items.push({
                    id: user.uri,
                    text: user.name
                });
            });
            cb(items);
        });
    };


    $scope.cbProjectItems = [];
    $scope.cbProjectFilter = function(text, cb) {
        console.log(text);
        $codeBeamer.getProjectList({
            page: 1,
            filter: text
        }, function(err, resp) {
            if (err) {
                return;
            }

            var items = [];
            resp.projects.forEach(function(project) {
                items.push({
                    id: project.uri,
                    text: project.name
                });
            });
            cb(items);
        });
    };

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
    $scope.tasks = {
        data: [
        ],
        links: [
        ]
    };

    $scope.setUser = function(uri) {
        if (uri === 'reset') {
            uri = null;
        }
        $state.go('ganttCbProject', {
            user: uri,
            project: projectUri
        });
    };

    $scope.setProject = function(uri) {
        $state.go('ganttCbProject', {
            user: userUri,
            project: uri
        });
    };

    function findTask(id: string): dhx.TTask {
        var t: dhx.TTask = null;
        var i, len=$scope.tasks.data.length;
        for (i=0; i<len; i++) {
            t = $scope.tasks.data[i];
            if (t.id === id) {
                return t;
            }
        }
        return t;
    }

    function setParentOpen(task: dhx.TTask) {
        if (task.parent) {
            var parentTask = findTask(task.parent);
            if (parentTask) {
                parentTask.open = true;
                setParentOpen(parentTask);
            }
        }
    }

    function covertCbTaskToDhxTask(cbTask: cb.TTask, parentUri?: string): dhx.TTask {
        console.log(cbTask);
        var task: dhx.TTask = {
            id: cbTask.uri,
            text: cbTask.name,
            start_date: new Date(cbTask.startDate || cbTask.modifiedAt),
            progress: cbTask.spentEstimatedHours || 0,
            priority: cbTask.priority ? cbTask.priority.name: 'Noraml'
        };

        var userNames = [];
        if (cbTask.assignedTo) {
            cbTask.assignedTo.forEach(function(user) {
                userNames.push(user.name);
            });
        }
        task.user = userNames.join(',');

        if (cbTask.estimatedMillis) {
            task.duration = (cbTask.estimatedMillis || 0)/unitDay;
        } else if (cbTask.endDate) {
            task.duration = (new Date(cbTask.endDate).getTime() - task.start_date.getTime())/unitDay;
        }

        if (!task.duration || task.duration < 1) {
            task.duration = 1;
        }

        if (parentUri) {
            task.parent = parentUri;
        }
        return task;
    }

    /**
     * Task Add
     * @param gantt
     * @param id
     * @param item
     */
    $scope.onTaskAdd = function(gantt, id, item: dhx.TTask) {
        if (taskTrackerUriList) {
            var param: cb.TParamCreateTask = {
                tracker: taskTrackerUriList[0],
                name: item.text,
                startDate: item.start_date,
                estimatedMillis: item.duration * unitDay,
                description: item.text + '\n\nCreated by ganttly',
                descFormat: "Wiki"
            };
            if (item.parent) {
                param.parent = item.parent;
            }

            $codeBeamer.createTask(param, function (err, resp) {
                if (err) {
                    console.log(err);
                    return;
                }
//                gantt.changeTaskId(id, resp.uri);
                var task = covertCbTaskToDhxTask(resp, item.parent);
                $scope.tasks.data.unshift(task);
                console.log($scope.tasks);
                gantt.refreshData();
            });
        }
    };

    $scope.onTaskUpdate = function(id, item: dhx.TTask) {
        console.log(item);
        var task: any = {
            uri: item.id,
            name: item.text,
            startDate: item.start_date,
            estimatedMillis: item.duration * unitDay,
            endDate: <any>new Date(item.start_date.getTime() + item.duration * unitDay)
        };
        if (item.progress) {
            task.spentMillis = item.duration * item.progress * unitDay;
        }
        $codeBeamer.updateTask(task, function(err, resp) {
        });
    };

    $scope.onTaskDelete = function(gantt, id, item) {
        console.log('onTaskDelete');
        var i, len=$scope.tasks.data.length, task: dhx.TTask;
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
        var task = findTask(id);
        if (task) {
            task.open = true;
        }
        return true;
    };

    $scope.onTaskClosed = function(gantt, id) {
        var task = findTask(id);
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
        var taskTo: dhx.TTask = gantt.getTask(toId);
        var taskFrom: dhx.TTask = gantt.getTask(fromId);
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

    $scope.onLinkAdd = function(gantt, id, item: dhx.TLink) {
        console.log(id, item);
        if (item.type === '0') {

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
                adjustStartTime(gantt, item.source, item.target);
                gantt.refreshData();
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
    var contextMenu: dhx.TContextMenu = {
        menuItems: [{
            id: 'open_task',
            text: '새창에서 열기',
            cb: function(param: dhx.TContextCbParam) {
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
    if (userUri) {
        param.userUri = userUri;
        $codeBeamer.getByUri(userUri, function(err, resp) {
            if (err) {
                return;
            }
            $scope.cbUserItems = [{
                id: 'reset',
                text: '모두'
            }, {
                id: resp.uri,
                text: resp.name
            }];
            $scope.cbUserSelected = resp.uri;
//            $scope.$apply();
        });
    }
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

        $codeBeamer.getReleases({
            projectUri: projectUri
        }, function(err, trackerUriList, resp) {
            if (err) {
                return;
            }
            resp.forEach(function(release) {
                console.log(release.name);
                var date = release.plannedReleaseDate ? new Date(release.plannedReleaseDate): new Date(release.modifiedAt);
                var date_to_str = gantt.date.date_to_str(gantt.config.task_date);
                gantt.addMarker({
                    start_date: date,
                    css: "release",
                    title: date_to_str(date),
                    text: release.name
                });
            });
        });
    }

    $codeBeamer.getTasks(param, function(err, trackerUriList: string[], items: cb.TTask[]) {
        if (err) {
            console.log(err);
            return;
        }

        taskTrackerUriList = trackerUriList;

        var taskUris = [], tasks: dhx.TTask[] = [], links: dhx.TLink[] = [];
        items.forEach(function(item) {
            taskUris.push(item.uri);
            tasks.push(covertCbTaskToDhxTask(item));
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
            if (item.parent) {
                tasks[i].parent = item.parent.uri;
            }
        });

        $scope.tasks = {
            data: tasks,
            links: links
        };
    }, function(msg) {
        dhtmlx.message(msg);
    });

});
