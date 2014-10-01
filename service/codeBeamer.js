/// <reference path="../defs/codeBeamer.d.ts"/>
/// <reference path="../typings/tsd.d.ts"/>
angular.module('ganttly').factory('$codeBeamer', function ($http) {
    // /tracker/type/6
    // http://tms.humaxdigital.com/rest/project/3/trackers?type=Task&hidden=true
    // http://tms.humaxdigital.com/rest/tracker/3802/items/page/1
    var user = 'swcho';
    var pass = 'swcho';
    var credentials = btoa(user + ':' + pass);
    var host = 'http://' + user + ':' + pass + '@10.0.14.229:8080/cb/rest';

    function get(aUrl, aParam, cb) {
        var url = host + aUrl;
        var param = aParam || {};
        console.log(url);
        $http({
            url: url,
            method: 'GET',
            withCredentials: true,
            headers: {
                'Authorization': 'Basic ' + credentials
            }
        }).success(function (resp) {
            console.log(resp);
            cb(null, resp);
        }).error(function (data, status, header, config) {
            cb({
                data: data,
                status: status,
                header: header,
                config: config
            });
        });
    }

    var codeBeamber = {
        getProjectList: function (aParam, aCb) {
            get('/projects/page/' + aParam.page, aParam, aCb);
        }
    };

    return codeBeamber;
});
//# sourceMappingURL=codeBeamer.js.map
