
/// <reference path="../../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="../../directive/dhxForm/dhxForm.ts"/>
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

    var gantt = new DhxExt.Gantt.CGantt(document.getElementById('idGantt'));

    gantt.setToolTipProvider(function(start,end,task){
        var ret = '';
        ret += '<p><b>' + task.text + '</b></p>';
        ret += '<hr>';

        if (task._warnings) {
            task._warnings.forEach(function(w) {
                ret += '<p class="warning">' + w + '</p>';
            });
        }

        ret += '<p>' + DhxGanttExt.formatDate(start) + ' - ' + DhxGanttExt.formatDate(end) + ' (' + task.duration + ')</p>';

        return ret;
    });

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
    UiUtils.ModalHelper.showModal('Getting information...');

    var groupings = UiUtils.GroupHelper.getGroupings(paramGroupings);
    var filters = UiUtils.FilterHelper.getFilterType(paramFilters);
    var sorting = UiUtils.SortHelper.getSortType(paramSort);

    UiUtils.getDhxDataByUser(paramUser, groupings, filters,  sorting, function(err, resp) {

        var prev_date = DhxGanttExt.getCenteredDate();

        // draw gantt chart
        DhxGanttExt.setScale(paramScale);

        gantt.clearAll();

        gantt.parse(resp);

        setTimeout(function() {
            DhxGanttExt.setDateCentered(prev_date || new Date());
        }, 5);

        // close modal
        UiUtils.ModalHelper.closeModal();
    });

    console.log('-------------------------');
});
