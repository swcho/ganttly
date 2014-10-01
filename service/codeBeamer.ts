
/// <reference path="../defs/codeBeamer.d.ts"/>
/// <reference path="../typings/tsd.d.ts"/>

angular.module('ganttly').factory('$codeBeamer',function($http: ng.IHttpService) {


    // /tracker/type/6
    // http://tms.humaxdigital.com/rest/project/3/trackers?type=Task&hidden=true
    // http://tms.humaxdigital.com/rest/tracker/3802/items/page/1
    var user = 'swcho';
    var pass = 'swcho';
    var credentials = btoa(user + ':' + pass);
    var host = 'http://'+ user + ':' + pass + '@10.0.14.229:8080/cb/rest';

    function get(aUrl, aParam, cb) {
        var param = aParam || {};
        $http({
            url: host + aUrl,
            method: 'GET',
            withCredentials: true,
            headers: {
                'Authorization': 'Basic ' + credentials
            }
        }).success(function(resp) {
            cb(null, resp);
        }).error(function(data, status, header, config) {
            cb({
                data: data,
                status: status,
                header: header,
                config: config
            });
        });
    }

    var codeBeamber: ICodeBeamer = {
        getProjectList: function(aParam: TParamGetProjectList, aCb: (err, resp: TRespGetProjectList) => void) {
            get('/projects/page/' + aParam.page, aParam, aCb);
        }
    };

    return codeBeamber;
});
