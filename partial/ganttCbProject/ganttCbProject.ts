
/// <reference path="../../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="../../directive/dhxForm/dhxForm.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/codeBeamer.ts"/>
/// <reference path="../../lib/UiUtils.ts"/>

declare var dhtmlXWindows;

angular.module('ganttly').controller('GanttCbProjectCtrl', function (
    $scope, $state, $stateParams) {

    console.log($stateParams);

    var paramProject = $stateParams.project;
    var paramScale = $stateParams.scale || 'week';
    var paramSort = $stateParams.sort || 'short_by_none';
    var paramGroupings: string[] = $stateParams.groupings ? $stateParams.groupings.split(',') : [];
    var paramFilters: string[] = $stateParams.filters ? $stateParams.filters.split(',') : [];

    var KUiRouterName = 'ganttCbProject';
    var context = new UiUtils.CAngularContext($scope);

    /**
     * Project selections
     *
     */

    UiUtils.ProjectHelper.create(context, document.getElementById('cbProject'), paramProject, function(id) {
        $state.go(KUiRouterName, {
            project: id
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
     *
     */

    var gantt = new UiUtils.CCbGantt(document.getElementById('idGantt'), true);
    context.addComponent(gantt);

    gantt.setContextMenu({
        menuItems: [{
            id: 'open_task',
            text: 'Open item',
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
            id: 'open_by_user',
            text: 'Edit in user view',
            onClick: function (id: string, param: DhxExt.Gantt.TGanttContextCbParam) {
                var task = gantt._gantt.getTask(param.taskId);
                if (task._userIdList && task._userIdList.length) {
                    $state.go('ganttCbUser', {
                        user: task._userIdList[0],
                        sort: 'sort_end_date_asc',
                        groupings: 'grp_release'
                    }, {
                        inherit: false
                    });
                }
            }
        }, {
            id: 'debug_task',
            text: 'Debug Task',
            onClick: function(id: string, param: DhxExt.Gantt.TGanttContextCbParam) {
                var task = gantt._gantt.getTask(param.taskId);
                console.log(task);
                debugger;
            }
        }]
    });

    if (!paramProject) {
        try {
            gantt.clearAll();
        } catch(e) {

        }
        return;
    }

    var groupings = UiUtils.GroupHelper.getGroupings(paramGroupings);
    var filters = UiUtils.FilterHelper.getFilterType(paramFilters);
    var sorting = UiUtils.SortHelper.getSortType(paramSort);

    UiUtils.ModalHelper.showModal('Getting information...');

    gantt.showTaskByProject(paramProject, groupings, filters, sorting, paramScale, function() {

        UiUtils.ModalHelper.closeModal();
    });

});
