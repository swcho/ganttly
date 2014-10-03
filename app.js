angular.module('ganttly', ['ui.bootstrap','ui.utils','ui.router','ngAnimate']);

angular.module('ganttly').config(function($stateProvider, $urlRouterProvider, $logProvider) {


    $stateProvider.state('gantt', {
        url: '/gantt?project&user',
        templateUrl: 'partial/gantt/gantt.html'
    });
    $stateProvider.state('ganttTrello', {
        url: '/ganttTrello',
        templateUrl: 'partial/ganttTrello/ganttTrello.html'
    });

    /* Add New States Above */
    $urlRouterProvider.otherwise('/gantt');

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
