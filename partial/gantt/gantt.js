/// <reference path="../../defs/codeBeamer.d.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
angular.module('ganttly').controller('GanttCtrl', function ($scope, $codeBeamer /*: ICodeBeamer*/ ) {
    $scope.tasks = {
        data: [
            {
                id: 1, text: "Project #2", start_date: "01-04-2013", duration: 18, order: 10,
                progress: 0.4, open: true },
            {
                id: 2, text: "Task #1", start_date: "02-04-2013", duration: 8, order: 10,
                progress: 0.6, parent: 1 },
            {
                id: 3, text: "Task #2", start_date: "11-04-2013", duration: 8, order: 20,
                progress: 0.6, parent: 1 }
        ],
        links: [
            { id: 1, source: 1, target: 2, type: "1" },
            { id: 2, source: 2, target: 3, type: "0" },
            { id: 3, source: 3, target: 4, type: "0" },
            { id: 4, source: 2, target: 5, type: "2" }
        ] };

    var unitDay = 1000 * 60 * 60 * 24;

    $scope.goProject = function (aUri) {
        console.log('goProject: ' + aUri);
        $codeBeamer.getProjectTask(aUri, function (err, resp) {
            if (err) {
                return;
            }

            var i, len = resp.length, task, data = [];
            for (i = 0; i < len; i++) {
                task = resp[i];
                data.push({
                    id: task.uri,
                    text: task.name,
                    start_date: new Date(task.startDate || task.modifiedAt),
                    duration: (task.estimatedMillis || unitDay) / unitDay
                });
            }

            $scope.tasks = {
                data: data
            };
        });
    };

    $scope.taskUpdate = function (id, item) {
        console.log('taskUpdate');
    };

    $codeBeamer.getProjectList({
        page: 1
    }, function (err, resp) {
        if (err) {
            return;
        }
        $scope.items = resp.projects;
    });
});
//# sourceMappingURL=gantt.js.map
