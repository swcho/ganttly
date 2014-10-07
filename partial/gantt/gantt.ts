
/// <reference path="../../defs/dhtmlxgannt.def.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>

angular.module('ganttly').controller('GanttCtrl', function ($scope, $state, $stateParams, $codeBeamer/*: ICodeBeamer*/) {

    console.log($stateParams);

    var projectUri = $stateParams.project;
    var userId = $stateParams.user;
    var taskTrackerUri: string;

    $scope.tasks = {
        data: [
//            {id: 1, text: "Project #2", start_date: "01-04-2013", duration: 18, order: 10,
//                progress: 0.4, open: true},
//            {id: 2, text: "Task #1", start_date: "02-04-2013", duration: 8, order: 10,
//                progress: 0.6, parent: 1},
//            {id: 3, text: "Task #2", start_date: "11-04-2013", duration: 8, order: 20,
//                progress: 0.6, parent: 1}
        ],
        links: [
//            { id: 1, source: 1, target: 2, type: "1"},
//            { id: 2, source: 2, target: 3, type: "0"},
//            { id: 3, source: 3, target: 4, type: "0"},
//            { id: 4, source: 2, target: 5, type: "2"},
        ]
    };

    var unitDay = 1000 * 60 * 60 * 24;
    $scope.goProject = function(uri) {
        $state.go('gantt', {
            project: uri
        });
    };

    $scope.onTaskAdd = function(gantt, id, item: TDhxTask) {
        if (taskTrackerUri) {
            console.log(id);
            console.log(item);
            var param: cb.TParamCreateTask = {
                tracker: taskTrackerUri,
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

    $scope.onLinkAdd = function(id, item: TDhxLink) {
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

    $codeBeamer.getProjectList({
        page: 1
    }, function(err, resp) {
        if (err) {
            return;
        }
        $scope.items = resp.projects
    });

    function showProject(aUri) {
        console.log('goProject: ' + aUri);
        $codeBeamer.getProjectTask(aUri, function(err, trackerUri, items: cb.TTask[]) {
            if (err) {
                return;
            }

            taskTrackerUri = trackerUri;

            var taskUris = [], tasks: TDhxTask[] = [], links: TDhxLink[] = [];
            items.forEach(function(item) {
                taskUris.push(item.uri);
                tasks.push({
                    id: item.uri,
                    text: item.name,
                    start_date: new Date(item.startDate || item.modifiedAt),
                    duration: (item.estimatedMillis || unitDay)/unitDay
                });
            });

            items.forEach(function(item, i) {
                if (item.associations) {
                    item.associations.forEach(function (association:cb.TAssociation) {
                        var index = taskUris.indexOf(association.to.uri);
                        if (index !== -1) {
                            if (association.type.name === 'depends') {
                                console.log('depends');
                                links.push({
                                    id: association.uri,
                                    source: association.to.uri,
                                    target: item.uri,
                                    type: '0'
                                });
                            } else if (association.type.name === 'child') {
                                console.log('child');
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
    }

    if (projectUri) {
        showProject(projectUri);
    }
});
