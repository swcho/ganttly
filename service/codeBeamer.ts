
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
        }).success(function(resp) {
            console.log(resp);
            aCb(null, resp);
        }).error(function(data, status, header, config) {
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
        }).success(function(resp) {
            console.log(resp);
            aCb(null, resp);
        }).error(function(data, status, header, config) {
            aCb({
                data: data,
                status: status,
                header: header,
                config: config
            });
        });
    }

    var codeBeamber: cb.ICodeBeamer = {
        getProjectList: function(aParam: cb.TParamGetProjectList, aCb: (err, resp?: cb.TRespGetProjectList) => void) {
            get('/projects/page/' + aParam.page, aParam, aCb);
        },
        getProjectTask: function(aProjectUri: string, aCb: (err, resp?: cb.TTask[]) => void) {

            var series = [];

            // get uri for task
            var uri;
            series.push(function(cb) {
                get(aProjectUri + '/trackers', {
                    type: 'Task'
                }, function(err, trackers: cb.TTracker[]) {
                    if (trackers && trackers.length) {
                        uri = trackers[0].uri;
                    }
                    cb(err);
                });
            });

            // get trackers all items
            var tasks: cb.TTask[];
            series.push(function(cb) {
                get(uri + '/items', null, function(err, items: cb.TTask[]) {
                    tasks = items;
                    cb(err);
                });
            });

            // find associations for each task
            series.push(function(cb) {
                var paralle = [];
                tasks.forEach(function(task: cb.TTask) {
                    paralle.push(function(cb) {
                        get(task.uri + '/associations', {
                            type: 'depends'
                        }, function(err, items: cb.TAssociation[]) {
                            task.associations = items;
                            cb();
                        });
                    });
                });
                async.parallelLimit(paralle, 1, function(err) {
                    cb();
                });
            });

            async.series(series, function(err) {
                aCb(err, tasks);
            });
        },
        updateTask: function(aTask, aCb) {
            put('/item', aTask, aCb);
        }
    };

    return codeBeamber;
});
