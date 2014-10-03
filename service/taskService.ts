
/// <reference path="../typings/tsd.d.ts"/>

class CTaskService {

    private _$http: ng.IHttpBackendService;

    constructor($http) {
        this._$http = $http;
    }

}

angular.module('ganttly').factory('taskService',function($http) {

    return new CTaskService($http);
});
