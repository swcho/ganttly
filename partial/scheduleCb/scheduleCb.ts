
/// <reference path="../../directive/dhxForm/dhxForm.ts"/>
/// <reference path="../../directive/dhxSchedule/dhxSchedule.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>

declare var dhtmlXWindows;
declare var dateFormat;

angular.module('ganttly').controller('ScheduleCbCtrl', function (
    $scope, $state, $stateParams, $calendar, $codeBeamer: cb.ICodeBeamer) {

    var paramProject = $stateParams.project || '/project/98';
    var paramGrouping = $stateParams.grouping || 'project';
    var paramType = $stateParams.type || 'test구분';
    var paramText = $stateParams.text || 'test단계';
    var paramStart = $stateParams.start;
    var paramEnd = $stateParams.end;

    if (!paramStart || !paramEnd) {

        var start = new Date();
        start.setDate(1);
        var end = start.getTime() + 5 * 7 * 24 * 60 * 60 * 1000;

        $state.go('scheduleCb', {
            start: start.getTime(),
            end: end
        }, {
            inherit: false
        });
        return;
    }

    function updateRange(startDate, endDate) {
        console.log(startDate, endDate);
        if (startDate < endDate) {
            scheduler.setCurrentView(startDate);
            var diff = (endDate-startDate)/(1000*60*60*24);
            scheduler['matrix'].timeline.x_size = Math.ceil(diff);
//            scheduler.update_view();
            scheduler.updateView();
            return true;
        }
        return false;
    }

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
            dateFormat: "%Y-%m-%d",
//            value: dateFormat("%Y-%m-%d", schState.min_date),
            eventHandlers: {
                onChange: function(value, state) {
                    var schState = scheduler.getState();
                    if (schState.min_date !== value) {
                        updateRange(value, schState.max_date);
                    }
                }
            }
        }]
    }, {
        type: "newcolumn"
    }, {
        type: 'block',
        list: [{
            name: 'end_date',
            type:"calendar",
            label: "End Date",
            offesetLeft: 10,
            inputLeft: 10,
//            skin:"dhx_skyblue",
            dateFormat: "%Y-%m-%d",
//            value: dateFormat("%Y-%m-%d", schState.max_date),
            eventHandlers: {
                onChange: function(value, state) {
                    var schState = scheduler.getState();
                    if (schState.max_date !== value) {
                        updateRange(schState.min_date, value);
                    }
                }
            }
        }]
    }];
    $scope.formItems = formItems;

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
                        start_date: new Date(task.startDate),
                        end_date: new Date(task.endDate),
                        text: (text ? text.name : type.name),
                        uri: task.uri,
                        comment: task.name,
                        color: task.status.style || '#b31317'
                    })
                });
            }
        });

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
        scheduler.parse(events, 'json');
        scheduler.openAllSections();
        updateRange(new Date(parseInt(paramStart, 10)), new Date(parseInt(paramEnd, 10)));

        var schState = scheduler.getState();
        $scope.start_date = schState.min_date;
        $scope.end_date = schState.max_date;
        $scope.onEventClicked = function(scheduler, id) {
            console.log('onEventClicked: ' + id);
            var event = scheduler.getEvent(id);
            console.log(event);

            var url = event.uri;
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
        };

    });

    console.log('-------------------------');
});
