/// <reference path="../../directive/dhxSchedule/dhxSchedule.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>

angular.module('ganttly').controller('ScheduleCbCtrl', function ($scope, $state, $stateParams, $calendar, $codeBeamer) {
    var paramProject = $stateParams.project || '/project/98';
    var paramGrouping = $stateParams.grouping || 'project';
    var paramType = $stateParams.type || 'test구분';
    var paramText = $stateParams.text || 'test단계';

    $codeBeamer.getTasks({
        projectUri: paramProject
    }, function (err, trackerUriList, tasks) {
        var sections = [];
        var sectionsMap = {};
        var types = [];
        var events = [];

        tasks.forEach(function (task) {
            var grouping = task[paramGrouping];
            var type = task[paramType];
            var text = task[paramText];

            var groupingKeyList = [];
            if (grouping && grouping.length) {
                grouping.forEach(function (g) {
                    if (!sectionsMap[g.uri]) {
                        sectionsMap[g.uri] = g;
                        sections.push({
                            key: g.uri,
                            label: g.name
                        });
                    }
                    groupingKeyList.push(g.uri);
                });
            }

            if (type) {
                if (types.indexOf(type.name) == -1) {
                    types.push(type.name);
                }
                groupingKeyList.forEach(function (gk) {
                    events.push({
                        section_id: gk + '/' + type.name,
                        //                        section_id: gk,
                        start_date: new Date(task.startDate),
                        end_date: new Date(task.endDate),
                        text: (text ? text.name : type.name)
                    });
                });
            }
        });

        scheduler.deleteAllSections();
        sections.forEach(function (s) {
            s.children = [];
            scheduler.addSection(s, null);
            types.forEach(function (t) {
                scheduler.addSection({
                    key: s.key + '/' + t,
                    label: t
                }, s.key);
            });
        });
        scheduler.setCurrentView(new Date());
        scheduler.parse(events, 'json');
        scheduler.openAllSections();
    });

    console.log('-------------------------');
});
//# sourceMappingURL=scheduleCb.js.map
