/// <reference path="../../defs/dhtmlxgannt.def.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>
angular.module('ganttly').controller('GanttCbProjectCtrl', function ($scope, $state, $stateParams, $codeBeamer /*: ICodeBeamer*/ ) {
    console.log($stateParams);

    var unitDay = 1000 * 60 * 60 * 24;

    var projectUri = $stateParams.project;
    var userId = $stateParams.user;
    var taskTrackerUri;

    $scope.selectedScale = "Select Scale";
    $scope.selectedProjectName = "Select Project";
    $scope.tasks = {
        data: [],
        links: []
    };

    $scope.setScale = function (scale) {
        var setScale = {
            'Day': function () {
                gantt.config.scale_unit = "day";
                gantt.config.step = 1;
                gantt.config.date_scale = "%d %M";
                gantt.config.subscales = [];
                gantt.config.scale_height = 27;
                gantt.templates.date_scale = null;
            },
            'Week': function () {
                var weekScaleTemplate = function (date) {
                    var dateToStr = gantt.date.date_to_str("%d %M");
                    var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
                    return dateToStr(date) + " - " + dateToStr(endDate);
                };

                gantt.config.scale_unit = "week";
                gantt.config.step = 1;
                gantt.templates.date_scale = weekScaleTemplate;
                gantt.config.subscales = [
                    { unit: "day", step: 1, date: "%D" }
                ];
                gantt.config.scale_height = 50;
            },
            'Month': function () {
                gantt.config.scale_unit = "month";
                gantt.config.date_scale = "%F, %Y";
                gantt.config.subscales = [
                    { unit: "day", step: 1, date: "%j, %D" }
                ];
                gantt.config.scale_height = 50;
                gantt.templates.date_scale = null;
            },
            'Year': function () {
                gantt.config.scale_unit = "year";
                gantt.config.step = 1;
                gantt.config.date_scale = "%Y";
                gantt.config.min_column_width = 50;

                gantt.config.scale_height = 90;
                gantt.templates.date_scale = null;

                var monthScaleTemplate = function (date) {
                    var dateToStr = gantt.date.date_to_str("%M");
                    var endDate = gantt.date.add(date, 2, "month");
                    return dateToStr(date) + " - " + dateToStr(endDate);
                };

                gantt.config.subscales = [
                    { unit: "month", step: 3, template: monthScaleTemplate },
                    { unit: "month", step: 1, date: "%M" }
                ];
            }
        };
        $scope.selectedScale = scale;
        setScale[scale]();
        gantt.render();
    };

    $scope.goProject = function (uri) {
        $state.go('ganttCbProject', {
            project: uri
        });
    };

    $scope.onTaskAdd = function (gantt, id, item) {
        if (taskTrackerUri) {
            console.log(id);
            console.log(item);
            var param = {
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

    $scope.onTaskUpdate = function (id, item) {
        $codeBeamer.updateTask({
            uri: item.id,
            name: item.text,
            startDate: item.start_date,
            estimatedMillis: item.duration * unitDay
        }, function (err, resp) {
        });
    };

    $scope.onTaskDelete = function (gantt, id, item) {
        $codeBeamer.deleteTask(id, function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    };

    $scope.onLinkAdd = function (id, item) {
        console.log(id, item);
        //        if (item.type === '0') {
        //            $codeBeamer.createAssociation({
        //                from: item.target,
        //                to: item.source
        //            }, function(err, association) {
        //            });
        //        }
    };

    $scope.onLinkUpdate = function (id, item) {
        console.log(id);
        console.log(item);
    };

    $scope.onLinkDelete = function (id, item) {
        console.log(id);
        console.log(item);
    };

    $codeBeamer.getProjectList({
        page: 1
    }, function (err, resp) {
        if (err) {
            return;
        }
        $scope.items = resp.projects;

        if (projectUri) {
            $scope.items.forEach(function (project) {
                if (project.uri === projectUri) {
                    $scope.selectedProjectName = project.name;
                }
            });
        }
    });

    function showProject(aUri) {
        console.log('goProject: ' + aUri);
        $codeBeamer.getProjectTask(aUri, function (err, trackerUri, items) {
            if (err) {
                return;
            }

            taskTrackerUri = trackerUri;

            var taskUris = [], tasks = [], links = [];
            items.forEach(function (item) {
                var userNames = [];
                if (item.assignedTo) {
                    item.assignedTo.forEach(function (user) {
                        userNames.push(user.name);
                    });
                }
                taskUris.push(item.uri);
                tasks.push({
                    id: item.uri,
                    text: item.name,
                    user: userNames.join(','),
                    start_date: new Date(item.startDate || item.modifiedAt),
                    duration: (item.estimatedMillis || unitDay) / unitDay,
                    progress: item.spentEstimatedHours || 0,
                    priority: item.priority.name
                });
            });

            items.forEach(function (item, i) {
                if (item.associations) {
                    item.associations.forEach(function (association) {
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
//# sourceMappingURL=ganttCbProject.js.map
