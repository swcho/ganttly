angular.module('ganttly', ['ui.bootstrap','ui.utils','ui.router','ngAnimate']);

angular.module('ganttly').config(function($stateProvider, $urlRouterProvider, $logProvider) {


    $stateProvider.state('configCb', {
        url: '/configCb',
        templateUrl: 'partial/configCb/configCb.html'
    });
    $stateProvider.state('ganttCbProject', {
        url: '/ganttCbProject?project&scale&sort&groupings&filters',
        templateUrl: 'partial/ganttCbProject/ganttCbProject.html'
    });
    $stateProvider.state('ganttCbUser', {
        url: '/ganttCbUser?user&scale&sort&groupings&filters',
        templateUrl: 'partial/ganttCbUser/ganttCbUser.html'
    });
    $stateProvider.state('scheduleCb', {
        url: '/scheduleCb?project&grouping&type&text&start&end',
        templateUrl: 'partial/scheduleCb/scheduleCb.html'
    });
    $stateProvider.state('ganttTrello', {
        url: '/ganttTrello?board&user',
        templateUrl: 'partial/ganttTrello/ganttTrello.html'
    });

    /* Add New States Above */
    $urlRouterProvider.otherwise('/ganttCbProject');

    $logProvider.debugEnabled(true);
});

angular.module('ganttly').run(function($rootScope) {

    $rootScope.safeApply = function(fn) {
        var phase = $rootScope.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

});
