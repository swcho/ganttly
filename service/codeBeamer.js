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

    function get(aUrl, aParam, aCb) {
        var url = host + aUrl;
        var param = aParam || {};
        console.log(url);
        $http({
            url: url,
            method: 'GET',
            params: param,
            withCredentials: true,
            headers: {
                'Authorization': 'Basic ' + credentials
            }
        }).success(function (resp) {
            console.log(resp);
            aCb(null, resp);
        }).error(function (data, status, header, config) {
            aCb({
                data: data,
                status: status,
                header: header,
                config: config
            });
        });
    }

    function put(aUrl, aParam, aCb) {
        var url = host + aUrl;
        var param = aParam || {};
        console.log(url);
        $http({
            url: url,
            method: 'PUT',
            data: param,
            withCredentials: true,
            headers: {
                'Authorization': 'Basic ' + credentials
            }
        }).success(function (resp) {
            console.log(resp);
            aCb(null, resp);
        }).error(function (data, status, header, config) {
            aCb({
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
        },
        getProjectTask: function (aProjectUri, aCb) {
            get(aProjectUri + '/trackers', {
                type: 'Task'
            }, function (err, resp) {
                if (err) {
                    aCb(err);
                    return;
                }

                get(resp[0].uri + '/items', null, aCb);
            });
        },
        updateTask: function (aTask, aCb) {
            put('/item', aTask, aCb);
        }
    };

    return codeBeamber;
});
//# sourceMappingURL=codeBeamer.js.map
