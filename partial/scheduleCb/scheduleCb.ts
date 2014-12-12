
/// <reference path="../../directive/dhxForm/dhxForm.ts"/>
/// <reference path="../../directive/dhxSchedule/dhxSchedule.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>

declare var dhtmlXWindows;

angular.module('ganttly').controller('ScheduleCbCtrl', function (
    $scope, $state, $stateParams, $calendar, $codeBeamer: cb.ICodeBeamer) {

    var formItems: dhx.TFormItem[] = [{
        type: "settings", position: "label-top"
    }, {
        type: 'block',
        list: [{
            name: 'start_date',
            type:"calendar",
            label:"Start Date",
//            skin:"dhx_skyblue",
//            enableTime:true,
            dateFormat: "%Y-%m-%d"
        }, {
            type: "newcolumn"
        }, {
            name: 'end_date',
            type:"calendar",
            label: "End Date",
            offesetLeft: 10,
            inputLeft: 10,
//            skin:"dhx_skyblue",
            dateFormat: "%Y-%m-%d"
        }]
    }];
    $scope.formItems = formItems;

    var paramProject = $stateParams.project || '/project/98';
    var paramGrouping = $stateParams.grouping || 'project';
    var paramType = $stateParams.type || 'test구분';
    var paramText = $stateParams.text || 'test단계';

    $codeBeamer.getTasks({
        projectUri: paramProject
    }, function(err, trackerUriList, tasks) {

        var sections: dhx.TSection[] = [];
        var sectionsMap = {};
        var types = [];
        var events: dhx.TEventItem[] = [];

        tasks.forEach(function(task) {
            var grouping = task[paramGrouping];
            var type = task[paramType];
            var text = task[paramText];

            var groupingKeyList = [];
            if (grouping && grouping.length) {
                grouping.forEach(function(g) {
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
                if (types.indexOf(type.name) === -1) {
                    types.push(type.name);
                }
                groupingKeyList.forEach(function(gk) {
                    events.push({
                        section_id: gk + '/' + type.name,
//                        section_id: gk,
                        start_date: new Date(task.startDate),
                        end_date: new Date(task.endDate),
                        text: (text ? text.name : type.name)
                    })
                });
            }
        });

        scheduler.deleteAllSections();
        sections.forEach(function(s) {
            s.children = [];
            scheduler.addSection(s, null);
            types.forEach(function(t) {
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
