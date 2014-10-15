/// <reference path="../../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>
angular.module('ganttly').controller('GanttCbProjectCtrl', function ($scope, $state, $stateParams, $codeBeamer) {
    console.log($stateParams);

    var unitDay = 1000 * 60 * 60 * 24;

    var userUri = $stateParams.user;
    var projectUri = $stateParams.project;
    var taskTrackerUriList;

    $scope.cbUserItems = [];
    $scope.cbUserFilter = function (text, cb) {
        console.log(text);
        $codeBeamer.getUserList({
            page: 1,
            filter: text
        }, function (err, resp) {
            if (err) {
                return;
            }

            var items = [];
            resp.users.forEach(function (user) {
                items.push({
                    id: user.uri,
                    text: user.name
                });
            });
            cb(items);
        });
    };

    $scope.cbProjectItems = [];
    $scope.cbProjectFilter = function (text, cb) {
        console.log(text);
        $codeBeamer.getProjectList({
            page: 1,
            filter: text
        }, function (err, resp) {
            if (err) {
                return;
            }

            var items = [];
            resp.projects.forEach(function (project) {
                items.push({
                    id: project.uri,
                    text: project.name
                });
            });
            cb(items);
        });
    };

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

    $scope.scale = 'Week';
    $scope.tasks = {
        data: [],
        links: []
    };

    $scope.setUser = function (uri) {
        if (uri === 'reset') {
            uri = null;
        }
        $state.go('ganttCbProject', {
            user: uri,
            project: projectUri
        });
    };

    $scope.setProject = function (uri) {
        $state.go('ganttCbProject', {
            user: userUri,
            project: uri
        });
    };

    /**
    * Task Add
    * @param gantt
    * @param id
    * @param item
    */
    $scope.onTaskAdd = function (gantt, id, item) {
        if (taskTrackerUriList) {
            console.log(id);
            console.log(item);
            var param = {
                tracker: taskTrackerUriList[0],
                name: item.text,
                startDate: item.start_date,
                estimatedMillis: item.duration * unitDay,
                description: item.text + '\n\n[Created by ganttly]',
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
                gantt.refreshData();
            });
        }
    };

    $scope.onTaskUpdate = function (id, item) {
        $codeBeamer.updateTask({
            uri: item.id,
            name: item.text,
            startDate: item.start_date,
            estimatedMillis: item.duration * unitDay,
            endDate: new Date(item.start_date.getTime() + item.duration * unitDay)
        }, function (err, resp) {
        });
    };

    $scope.onTaskDelete = function (gantt, id, item) {
        $codeBeamer.deleteTask(id, function (err) {
            if (err) {
                console.log(err);
                return;
            }
            window.location.reload();
        });
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
            $codeBeamer.createAssociation({
                from: item.target,
                to: item.source
            }, function (err, association) {
                if (err) {
                    return;
                }
                gantt.changeLinkId(id, association.uri);
                adjustStartTime(gantt, item.source, item.target);
                gantt.refreshData();
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
        menuItems: [{
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
    var param = {};
    if (userUri) {
        param.userUri = userUri;
        $codeBeamer.getByUri(userUri, function (err, resp) {
            if (err) {
                return;
            }
            $scope.cbUserItems = [
                {
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
        $codeBeamer.getByUri(projectUri, function (err, resp) {
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
    }

    $codeBeamer.getTasks(param, function (err, trackerUriList, items) {
        if (err) {
            console.log(err);
            return;
        }

        taskTrackerUriList = trackerUriList;

        var taskUris = [], tasks = [], links = [];
        items.forEach(function (item) {
            var userNames = [];
            if (item.assignedTo) {
                item.assignedTo.forEach(function (user) {
                    userNames.push(user.name);
                });
            }
            taskUris.push(item.uri);

            var task = {
                id: item.uri,
                text: item.name,
                user: userNames.join(','),
                start_date: new Date(item.startDate || item.modifiedAt),
                progress: item.spentEstimatedHours || 0,
                priority: item.priority.name
            };
            if (item.estimatedMillis) {
                task.duration = (item.estimatedMillis || 0) / unitDay;
            } else if (item.endDate) {
                task.duration = (new Date(item.endDate).getTime() - task.start_date.getTime()) / unitDay;
            } else {
                task.duration = 1;
            }
            tasks.push(task);
        });

        items.forEach(function (item, i) {
            if (item.associations) {
                item.associations.forEach(function (association) {
                    var indexTo = association.to ? taskUris.indexOf(association.to.uri) : -1;
                    var indexFrom = association.from ? taskUris.indexOf(association.from.uri) : -1;
                    if (indexTo !== -1) {
                        if (association.type.name === 'depends') {
                            links.push({
                                id: association.uri,
                                source: association.to.uri,
                                target: item.uri,
                                type: '0'
                            });
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
    }, function (msg) {
        dhtmlx.message(msg);
    });
});
//# sourceMappingURL=ganttCbProject.js.map
