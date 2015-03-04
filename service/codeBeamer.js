/// <reference path="../typings/tsd.d.ts"/>
angular.module('ganttly').factory('$codeBeamer', function ($http) {
    var host = gConfig.cbBaseUrl + '/rest';
    var user = gConfig.cbUser;
    var pass = gConfig.cbPass;
    var concurrentCount = gConfig.concurrentCount || 5;
    var withCredentials = false;
    var credentials;
    if (user && pass) {
        withCredentials = true;
        credentials = btoa(user + ':' + pass);
    }
    function send(aMethod, aUrl, aParam, aCb) {
        var url = host + aUrl;
        console.log(aMethod + ': ' + url);
        var options = {};
        options.url = url;
        options.method = aMethod;
        if (aParam) {
            if (aMethod === 'POST' || aMethod === 'PUT') {
                options.data = aParam;
            }
            else {
                options.params = aParam;
            }
        }
        if (withCredentials) {
            options.withCredentials = true;
            options.headers = {
                'Authorization': 'Basic ' + credentials
            };
        }
        $http(options).success(function (resp) {
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
    function get(aUrl, aParam, aCb) {
        send('GET', aUrl, aParam, aCb);
    }
    function put(aUrl, aParam, aCb) {
        send('PUT', aUrl, aParam, aCb);
    }
    function post(aUrl, aParam, aCb) {
        send('POST', aUrl, aParam, aCb);
    }
    function del(aUrl, aCb) {
        send('DELETE', aUrl, null, aCb);
    }
    var codeBeamber = {
        getByUri: function (aUri, aCb) {
            get(aUri, {}, aCb);
        },
        getUserList: function (aParam, aCb) {
            get('/users/page/' + aParam.page, aParam, aCb);
        },
        getProjectList: function (aParam, aCb) {
            get('/projects/page/' + aParam.page, aParam, aCb);
        },
        getTasks: function (aParam, aCb, aProgress) {
            // http://10.0.14.229/cb/rest/user/3/items?type=Task
            // http://10.0.14.229/cb/rest/user/3/items?type=Task&role=swcho&onlyDirect=true
            function progress(msg) {
                if (aProgress) {
                    aProgress(msg);
                }
                console.info(msg);
            }
            var baseUri = '';
            if (aParam.userUri) {
                baseUri = baseUri + aParam.userUri;
            }
            if (aParam.projectUri) {
                baseUri = baseUri + aParam.projectUri;
            }
            var series = [];
            // get uri for task
            var trackerUriList = [];
            series.push(function (cb) {
                progress('getting uri for task');
                get(baseUri + '/trackers', {
                    type: 'Task'
                }, function (err, items) {
                    items.forEach(function (item) {
                        if (item.uri) {
                            trackerUriList.push(item.uri);
                        }
                        // when base uri is /user/[id]
                        if (item.trackers) {
                            item.trackers.forEach(function (tracker) {
                                trackerUriList.push(tracker.uri);
                            });
                        }
                    });
                    cb(err);
                });
            });
            // get trackers all items
            var tasks = [];
            if (aParam.userUri) {
                series.push(function (cb) {
                    progress('getting trackers all items');
                    get(baseUri + '/items', {
                        type: 'Task'
                    }, function (err, items) {
                        tasks = tasks.concat(items);
                        cb(err);
                    });
                });
            }
            else {
                series.push(function (cb) {
                    progress('getting trackers all items');
                    var parallel = [];
                    trackerUriList.forEach(function (trackerUri) {
                        parallel.push(function (cb) {
                            get(trackerUri + '/items', null, function (err, items) {
                                tasks = tasks.concat(items);
                                cb(err);
                            });
                        });
                    });
                    async.parallelLimit(parallel, concurrentCount, function (err) {
                        cb(err);
                    });
                });
            }
            // find associations for each task
            var additionalTaskUris = [];
            series.push(function (cb) {
                progress('finding associations for each task');
                var taskUriList = [];
                tasks.forEach(function (task) {
                    taskUriList.push(task.uri);
                });
                var parallel = [];
                tasks.forEach(function (task) {
                    parallel.push(function (cb) {
                        get(task.uri + '/associations', {
                            type: 'depends,child,parent',
                            inout: true
                        }, function (err, items) {
                            task.associations = items;
                            items.forEach(function (associ) {
                                if (associ.to && taskUriList.indexOf(associ.to.uri) === -1) {
                                    additionalTaskUris.push(associ.to.uri);
                                }
                                if (associ.from && taskUriList.indexOf(associ.from.uri) === -1) {
                                    additionalTaskUris.push(associ.from.uri);
                                }
                            });
                            cb();
                        });
                    });
                });
                async.parallelLimit(parallel, concurrentCount, function (err) {
                    cb(err);
                });
            });
            series.push(function (cb) {
                progress('getting tasks and its associations outside project');
                var parallel = [];
                console.log(additionalTaskUris.length);
                additionalTaskUris.forEach(function (uri) {
                    parallel.push(function (cb) {
                        get(uri, null, function (err, item) {
                            if (err) {
                                cb(err);
                                return;
                            }
                            if (!item.tracker) {
                                cb();
                                return;
                            }
                            if (item.tracker.name !== 'Task') {
                                cb();
                                return;
                            }
                            tasks.push(item);
                            get(item.uri + '/associations', {
                                type: 'depends,child,parent',
                                inout: true
                            }, function (err, associations) {
                                if (err) {
                                    cb(err);
                                    return;
                                }
                                item.associations = associations;
                                cb();
                            });
                        });
                    });
                });
                async.parallelLimit(parallel, concurrentCount, function (err) {
                    cb(err);
                });
            });
            async.series(series, function (err) {
                aCb(err, trackerUriList, tasks);
            });
        },
        getReleases: function (aParam, aCb) {
            var projectUri = aParam.projectUri;
            var series = [];
            // get uri for task
            var trackerUriList = [];
            series.push(function (cb) {
                get(projectUri + '/categories', {
                    type: 'Release'
                }, function (err, items) {
                    items.forEach(function (item) {
                        if (item.uri) {
                            trackerUriList.push(item.uri);
                        }
                        // when base uri is /user/[id]
                        if (item.trackers) {
                            item.trackers.forEach(function (tracker) {
                                trackerUriList.push(tracker.uri);
                            });
                        }
                    });
                    cb(err);
                });
            });
            // get trackers all items
            var releases = [];
            series.push(function (cb) {
                var parallel = [];
                trackerUriList.forEach(function (trackerUri) {
                    parallel.push(function (cb) {
                        get(trackerUri + '/items', null, function (err, items) {
                            releases = releases.concat(items);
                            cb(err);
                        });
                    });
                });
                async.parallelLimit(parallel, concurrentCount, function (err) {
                    cb(err);
                });
            });
            async.series(series, function (err) {
                aCb(err, trackerUriList, releases);
            });
        },
        createTask: function (aParam, aCb) {
            post('/item', aParam, function (err, resp) {
                if (err) {
                    aCb(err);
                    return;
                }
                get(resp.uri, null, aCb);
            });
        },
        updateTask: function (aTask, aCb) {
            put('/item', aTask, function (err, resp) {
                if (err) {
                    aCb(err);
                    return;
                }
                get(aTask.uri, null, aCb);
            });
        },
        deleteTask: function (aTaskUri, aCb) {
            del(aTaskUri, aCb);
        },
        createAssociation: function (aParam, aCb) {
            aParam.type = aParam.type || "/association/type/1";
            aParam.propagatingSuspects = aParam.propagatingSuspects || false;
            if (!aParam.description) {
                aParam.description = "Generated by ganttly";
                aParam.descFormat = "Wiki";
            }
            post('/association', aParam, aCb);
        },
        updateAssociation: function (aParam, aCb) {
            put('/association', aParam, aCb);
        },
        deleteAssociation: function (aAssociationUri, aCb) {
            del(aAssociationUri, aCb);
        }
    };
    return codeBeamber;
});
//# sourceMappingURL=codeBeamer.js.map