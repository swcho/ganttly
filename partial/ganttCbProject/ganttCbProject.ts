
/// <reference path="../../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>

angular.module('ganttly').controller('GanttCbProjectCtrl', function ($scope, $state, $stateParams, $codeBeamer: cb.ICodeBeamer) {

    console.log($stateParams);

    var unitDay = 1000 * 60 * 60 * 24;

    var userUri = $stateParams.user;
    var projectUri = $stateParams.project;
    var taskTrackerUriList: string[];

    $scope.selectedUser = "노동자";
    $scope.selectedProjectName = "플젝";

    $scope.comboConfigScale = {
        items: [{
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
        }]
    };

    $scope.scale = 'Week';
    $scope.tasks = {
        data: [
        ],
        links: [
        ]
    };

    $scope.setUser = function(uri) {
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

    $scope.onTaskAdd = function(gantt, id, item: dhx.TTask) {
        if (taskTrackerUriList) {
            console.log(id);
            console.log(item);
            var param: cb.TParamCreateTask = {
                tracker: taskTrackerUriList[0],
                name: item.text,
                startDate: item.start_date,
                estimatedMillis: item.duration * unitDay
            };
            if (item.parent) {
                param.parent = item.parent;
            }

            $codeBeamer.createTask(param, function (err, resp) {
                if (err) {
                    console.log(err);
                    return;
                }
                gantt.changeTaskId(id, resp.uri);
            });
        }
    };

    $scope.onTaskUpdate = function(id, item) {
        $codeBeamer.updateTask({
            uri: item.id,
            name: item.text,
            startDate: item.start_date,
            estimatedMillis: item.duration * unitDay
        }, function(err, resp) {

        });
    };

    $scope.onTaskDelete = function(gantt, id, item) {
        $codeBeamer.deleteTask(id, function(err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    };

    $scope.onLinkAdd = function(id, item: dhx.TLink) {
        console.log(id, item);
//        if (item.type === '0') {
//            $codeBeamer.createAssociation({
//                from: item.target,
//                to: item.source
//            }, function(err, association) {
//            });
//        }
    };

    $scope.onLinkUpdate = function(id, item) {
        console.log(id);
        console.log(item);
    };

    $scope.onLinkDelete = function(id, item) {
        console.log(id);
        console.log(item);
    };

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

    $codeBeamer.getUserList({
        page: 1
    }, function(err, resp) {
        if (err) {
            return;
        }
        $scope.userList = resp.users;

        if (userUri) {
            $scope.userList.forEach(function(user: cb.TUser) {
                if (user.uri === userUri) {
                    $scope.selectedUser = user.name;
                }
            });
        }
    });

    $codeBeamer.getProjectList({
        page: 1
    }, function(err, resp) {
        if (err) {
            return;
        }
        $scope.projectList = resp.projects;

        if (projectUri) {
            $scope.projectList.forEach(function(project: cb.TProject) {
                if (project.uri === projectUri) {
                    $scope.selectedProjectName = project.name;
                }
            });
        }
    });

    if (!userUri || !projectUri) {
        return;
    }

    var param: cb.TParamGetTask = {};
    if (userUri) {
        param.userUri = userUri;
    }
    if (projectUri) {
        param.projectUri = projectUri;
    }

    $codeBeamer.getTasks(param, function(err, trackerUriList: string[], items: cb.TTask[]) {
        if (err) {
            console.log(err);
            return;
        }

        taskTrackerUriList = trackerUriList;

        var taskUris = [], tasks: dhx.TTask[] = [], links: dhx.TLink[] = [];
        items.forEach(function(item) {
            var userNames = [];
            if (item.assignedTo) {
                item.assignedTo.forEach(function(user) {
                    userNames.push(user.name);
                });
            }
            taskUris.push(item.uri);

            var task: dhx.TTask = {
                id: item.uri,
                text: item.name,
                user: userNames.join(','),
                start_date: new Date(item.startDate || item.modifiedAt),
                progress: item.spentEstimatedHours || 0,
                priority: item.priority.name
            };
            if (item.estimatedMillis) {
                task.duration = (item.estimatedMillis || 0)/unitDay;
            }
            if (item.endDate) {
                task.end_date = new Date(item.endDate);
            }
            tasks.push(task);
        });

        items.forEach(function(item, i) {
            if (item.associations) {
                item.associations.forEach(function (association:cb.TAssociation) {
                    var index = taskUris.indexOf(association.to.uri);
                    if (index !== -1) {
                        if (association.type.name === 'depends') {
                            links.push({
                                id: association.uri,
                                source: association.to.uri,
                                target: item.uri,
                                type: '0'
                            });
                        } else if (association.type.name === 'child') {
                            tasks[i].parent = association.to.uri;
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
    });

});
