
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../lib/DhxExt.ts"/>
/// <reference path="../../lib/UiUtils.ts"/>

angular.module('ganttly').controller('GanttCbUserCtrl', function (
    $scope, $state, $stateParams) {

    console.log($stateParams);

    var paramUser = $stateParams.user;
    var paramScale = $stateParams.scale || 'week';
    var paramSort = $stateParams.sort || 'short_by_none';
    var paramGroupings: string[] = $stateParams.groupings ? $stateParams.groupings.split(',') : [];
    var paramFilters: string[] = $stateParams.filters ? $stateParams.filters.split(',') : [];


    var KUiRouterName = 'ganttCbUser';
    var context = new UiUtils.CAngularContext($scope);

    /**
     * User selections
     */

    UiUtils.UserHelper.create(context, document.getElementById('cbUser'), paramUser, function(id) {
        $state.go(KUiRouterName, {
            user: id
        }, {
            inherit: true
        });
    });

    /**
     * Sorting
     */

    UiUtils.SortHelper.createCombo(context, document.getElementById('cbSort'), paramSort, function(id) {
        $state.go(KUiRouterName, {
            sort: id
        }, {
            inherit: true
        });
    });

    /**
     * Groupings
     *
     */

    var elements = [document.getElementById('cbGroup1'), document.getElementById('cbGroup2')];
    UiUtils.GroupHelper.createComboForProject(context, elements, paramGroupings, function(selections) {
        $state.go(KUiRouterName, {
            groupings: selections.join(',')
        }, {
            inherit: true
        });
    });

    /**
     * Scales
     */

    UiUtils.ScaleHelper.createCombo(context, document.getElementById('idScale'), paramScale, function(id) {
        $state.go(KUiRouterName, {
            scale: id
        }, {
            inherit: true
        });
    });

    /**
     * Filter options
     */

    UiUtils.FilterHelper.create(context, document.getElementById('idFilters'), paramFilters, function(filters) {
        $state.go(KUiRouterName, {
            filters: filters.join(',')
        }, {
            inherit: true
        });
    });

    /**
     * Navigation button
     */
    var frmNavi = new DhxExt.CForm(document.getElementById('idNavi'), [{
        name: 'bt_navi_today',
        type: 'button',
        value: 'Today',
        eventHandlers: {
            onButtonClick: function() {
                DhxGanttExt.setDateCentered(new Date());
            }
        }
    }]);
    context.addComponent(frmNavi);

    /**
     * Gantt
     */

    var gantt = new UiUtils.CCbGantt(document.getElementById('idGantt'), false);
    context.addComponent(gantt);

    gantt.setContextMenu({
        menuItems: [{
            id: 'open_task',
            text: 'Open in new window',
            onClick: function (id: string, param: DhxExt.Gantt.TGanttContextCbParam) {
                var url = param.taskId || param.linkId;
                var width = 1280;
                var height = 720;
                var params = [
                    'width=' + width,
                    'height=' + height,
                    'fullscreen=yes' // only works in IE, but here for completeness
                ].join(',');
                var win = open(gConfig.cbBaseUrl + url, null, params);
                win.moveTo((screen.width - width) / 2, (screen.height - height) / 2);
                win.resizeTo(width, height);
            }
        }, {
            id: 'adjust_schedule',
            text: 'Adjust associated schedules',
            onClick: function(id: string, param: DhxExt.Gantt.TGanttContextCbParam) {
//                console.log(param);
                UiUtils.ModalHelper.showModal("Rescheduling tasks");
                gantt.adjustDependentTasks(param.taskId, function() {
                    UiUtils.ModalHelper.closeModal();
                });
            }
        }, {
            id: 'partial_refresh',
            text: 'Partial refresh',
            onClick: function(id: string, param: DhxExt.Gantt.TGanttContextCbParam) {
                gantt.refreshTask(param.taskId, function() {

                });
            }
        }]
    });

//    gantt.onDblClicked = function(taskId) {
//        var url = taskId;
//        var width = 1280;
//        var height = 720;
//        var params = [
//                'width=' + width,
//                'height=' + height,
//            'fullscreen=yes' // only works in IE, but here for completeness
//        ].join(',');
//        var win = open(gConfig.cbBaseUrl + url, null, params);
//        win.moveTo((screen.width - width)/2, (screen.height - height)/2);
//        win.resizeTo(width, height);
//    };

    if (!paramUser) {
        try {
            gantt.clearAll();
        } catch(e) {

        }
        return;
    }

    /**
     * Display Tasks
     * @type {{}}
     */

    var groupings = UiUtils.GroupHelper.getGroupings(paramGroupings);
    var filters = UiUtils.FilterHelper.getFilterType(paramFilters);
    var sorting = UiUtils.SortHelper.getSortType(paramSort);

    UiUtils.ModalHelper.showModal('Getting information...');

    gantt.showTaskByUser(paramUser, groupings, filters, sorting, paramScale, function() {

        UiUtils.ModalHelper.closeModal();
    });

    console.log('-------------------------');
});
