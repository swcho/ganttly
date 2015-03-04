/// <reference path="../typings/tsd.d.ts"/>
var CTaskService = (function () {
    function CTaskService($http) {
        this._$http = $http;
    }
    return CTaskService;
})();
angular.module('ganttly').factory('taskService', function ($http) {
    return new CTaskService($http);
});
//# sourceMappingURL=taskService.js.map