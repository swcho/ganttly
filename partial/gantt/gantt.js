/// <reference path="../../defs/codeBeamer.d.ts"/>
/// <reference path="../../defs/dhtmlxgannt.def.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
angular.module('ganttly').controller('GanttCtrl', function ($scope, $state, $stateParams, $codeBeamer /*: ICodeBeamer*/ ) {
    console.log($stateParams);

    var projectUri = $stateParams.project;
    var userId = $stateParams.user;

    $scope.tasks = {};

    var unitDay = 1000 * 60 * 60 * 24;
    $scope.goProject = function (uri) {
        $state.go('gantt', {
            project: uri
        });
    };

    $scope.onTaskUpdated = function (id, item) {
        $codeBeamer.updateTask({
            uri: item.id,
            name: item.text,
            startDate: item.start_date,
            estimatedMillis: item.duration * unitDay
        }, function (err, resp) {
        });
    };

    $scope.onLinkAdded = function (id, item) {
        console.log(id, item);
    };

    $codeBeamer.getProjectList({
        page: 1
    }, function (err, resp) {
        if (err) {
            return;
        }
        $scope.items = resp.projects;
    });

    function showProject(aUri) {
        console.log('goProject: ' + aUri);
        $codeBeamer.getProjectTask(aUri, function (err, items) {
            if (err) {
                return;
            }

            var taskUris = [], tasks = [], links = [];
            items.forEach(function (item) {
                taskUris.push(item.uri);
                tasks.push({
                    id: item.uri,
                    text: item.name,
                    start_date: new Date(item.startDate || item.modifiedAt),
                    duration: (item.estimatedMillis || unitDay) / unitDay
                });

                if (item.associations) {
                    item.associations.forEach(function (association) {
                        if (taskUris.indexOf(association.to.uri) != -1) {
                            links.push({
                                id: association.uri,
                                source: association.to.uri,
                                target: item.uri,
                                type: '0'
                            });
                        }
                    });
                }
            });

            $scope.tasks = {
                data: tasks,
                links: links
            };
        });
    }
    ;

    if (projectUri) {
        showProject(projectUri);
    }
});
//# sourceMappingURL=gantt.js.map
