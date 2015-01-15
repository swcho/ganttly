
/// <reference path="../typings/tsd.d.ts"/>

/**
 * codeBeamer definitions
 */

declare module cb {

    interface TItem {
        uri: string;
        name: string;
    }

    interface TProject extends TItem {
        description: string;
        descFormat: string;
        category: string;
        closed: boolean;
        deleted: boolean;
    }

    interface TType {
        name: string;
        url: string;
    }

    interface TTracker extends TItem {
        descFormat: string;
        description: string;
        keyName: string;
        type: TType;
        project: TItem;
    }

    interface TUser extends TItem {

    }

    interface TEnum {
        flags: number;
        id: number;
        name: string;
        style?: string; // color code
    }

    interface TTask extends TItem {
        descFormat?: string;
        description?: string;
        estimatedMillis?: number;
        modifiedAt?: string; // Date
        modifier?: TUser;
        priority?: TEnum;
        startDate?: string; // Date
        endDate?: string; // Date
        status?: TEnum;
        submittedAt?: string; // Date
        submitter?: TUser;
        tracker?: TTracker;
        version?: number;
        parent?: TItem;
        assignedTo?: TItem[]; // users
        associations?: TAssociation[];
        spentEstimatedHours?: number;
        spentMillis?: number;
    }

    interface TRelease extends TItem {
        parent?: TItem;
        tracker?: TItem;
        status?: TEnum;
        plannedReleaseDate?: string; // Date
        submittedAt?: string; // Date
        submitter?: TUser;
        modifiedAt?: string; // Date
        modifier?: TUser;
        description?: string;
        descFormat?: string;
    }

    interface TAssociation extends TItem {
        from: TItem; // uri
        to: TItem; // uri
        type: any; // uri
        propagatingSuspects: boolean;
        description: string;
        descFormat: string;
    }

    interface TSchema {
        title: string; // ex) Task
        plural: string; // ex) Tasks
        description: string;
        properties: {

        }
    }

    interface TSchemaType {
        title: string;
        type: string;
        format?: string; // validator for string
        maxLength?: number; // validator for string
        minimum?: number; // validator for number
        properties: TSchemaType[];
        required?: string; // validator for properties
        enum?: TEnum[];
        uniqueItems?: boolean;
        optionsURI?: string;
    }

    interface TParamPage {
        page: number;
        pagesize?: number; // default is 100
        category?: string;
        filter?: string;
    }

    interface TRespPagedItems {
        page: number;
        size: number;
        total: number;
        projects: any[];
        users: any[];
    }

    interface TParamGetTask {
        userUri?: string;
        projectUri?: string;
        groupByProject?: boolean;
        groupByUser?: boolean;
    }

    interface TParamGetRelease {
        projectUri?: string;
    }

    interface TParamCreateAssociation {
        from: string; // uri
        to: string; // uri
        type?: string; // ex) "/association/type/depends"
        propagatingSuspects?: boolean;
        description?: string;
        descFormat?: string;
    }

    interface TRespCreateItem {
        item: {
            version: number;
            tracker: { // tracker
                project: TItem; // project
                uri: string;
                name: string;
            };
            priority: TEnum;
            submitter: TItem; // user
            descFormat: string;
        }
        type: TSchemaType;
        permissions: {
            id: number;
            parent: number;
            tracker: number;
            priority: number;
            name: number;
            status: number;
            severity: number;
            resolution: number;
            release: number;
            assignedTo: number;
            submittedAt: number;
            submitter: number;
            modifiedAt: number;
            modifier: number;
            startDate: number;
            endDate: number;
            estimatedMillis: number;
            accruedMillis: number;
            spentMillis: number;
            spentEstimatedHours: number;
            description: number;
            descFormat: number;
            comments: number;
            children: number;
        }
    }

    interface TParamCreateTask {
        tracker: string; // tracker uri
        name: string;
        parent?: string; // project uri
        priority?: string;
        status?: string;
        severity?: string;
//        resolution: number;
//        release: number;
//        assignedTo: number;
//        submittedAt: number;
//        submitter: number;
//        modifiedAt: number;
//        modifier: number;
        startDate?: Date;
        endDate?: Date;
        estimatedMillis?: number;
//        accruedMillis: number;
//        spentMillis: number;
//        spentEstimatedHours?: number;
        description?: string;
        descFormat?: string;
//        comments: number;
//        children: number;
    }

    interface ICodeBeamer {
        getByUri(aUri: string, aCb:(err, resp) => void);
        getUserList(aParam: TParamPage, aCb:(err, resp?: TRespPagedItems) => void);
        getProjectList(aParam: TParamPage, aCb:(err, resp?: TRespPagedItems) => void);
        getTasks(aParam: TParamGetTask, aCb:(err, trackerUriList: string[], resp?: TTask[]) => void, aProgress?: (msg) => void);
        getReleases(aParam: TParamGetRelease, aCb:(err, trackerUriList: string[], resp?: TRelease[]) => void);
        createTask(aParam: TParamCreateTask, aCb:(err, resp?: TTask) => void);
        updateTask(aTask: cb.TTask, aCb: (err, resp?: cb.TTask) => void);
        deleteTask(aTaskUri: string, aCb: (err, resp) => void);
        createAssociation(aParam: TParamCreateAssociation, aCb:(err, resp?: TAssociation) => void);
        deleteAssociation(aAssociationUri: string, aCb:(err, resp) => void);
    }
}

declare var gConfig;

angular.module('ganttly').factory('$codeBeamer',function($http: ng.IHttpService) {

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
        var options: any  = {};
        options.url = url;
        options.method = aMethod;
        if (aParam) {
            if (aMethod === 'POST' || aMethod === 'PUT') {
                options.data = aParam;
            } else {
                options.params = aParam;
            }
        }
        if (withCredentials) {
            options.withCredentials = true;
            options.headers = {
                'Authorization': 'Basic ' + credentials
            }
        }

        $http(options).success(function(resp) {
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

    var codeBeamber: cb.ICodeBeamer = {
        getByUri: function(aUri: string, aCb:(err, resp) => void) {
            get(aUri, {}, aCb);
        },
        getUserList: function(aParam: cb.TParamPage, aCb:(err, resp?: cb.TRespPagedItems) => void) {
            get('/users/page/' + aParam.page, aParam, aCb);
        },
        getProjectList: function(aParam: cb.TParamPage, aCb: (err, resp?: cb.TRespPagedItems) => void) {
            get('/projects/page/' + aParam.page, aParam, aCb);
        },
        getTasks: function(aParam: cb.TParamGetTask, aCb: (err, trackerUriList: string[], resp?: cb.TTask[]) => void, aProgress?: (msg) => void) {
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
            series.push(function(cb) {
                progress('getting uri for task');
                get(baseUri + '/trackers', {
                    type: 'Task'
                }, function(err, items) {

                    items.forEach(function(item) {
                        if (item.uri) {
                            trackerUriList.push(item.uri);
                        }

                        // when base uri is /user/[id]
                        if (item.trackers) {
                            item.trackers.forEach(function(tracker) {
                                trackerUriList.push(tracker.uri);
                            });
                        }
                    });

                    cb(err);
                });
            });

            // get trackers all items
            var tasks: cb.TTask[] = [];
            if (aParam.userUri) {
                series.push(function(cb) {
                    progress('getting trackers all items');

                    get(baseUri + '/items', {
                        type: 'Task'
                    }, function(err, items: cb.TTask[]) {
                        tasks = tasks.concat(items);
                        cb(err);
                    });
                });
            } else {
                series.push(function(cb) {
                    progress('getting trackers all items');

                    var parallel = [];
                    trackerUriList.forEach(function(trackerUri) {
                        parallel.push(function(cb) {
                            get(trackerUri + '/items', null, function(err, items: cb.TTask[]) {
                                tasks = tasks.concat(items);
                                cb(err);
                            });
                        });
                    });
                    async.parallelLimit(parallel, concurrentCount, function(err) {
                        cb(err);
                    });
                });
            }

            // find associations for each task
            var additionalTaskUris = [];
            series.push(function(cb) {
                progress('finding associations for each task');

                var taskUriList = [];
                tasks.forEach(function(task) {
                    taskUriList.push(task.uri);
                });

                var parallel = [];
                tasks.forEach(function(task: cb.TTask) {
                    parallel.push(function(cb) {
                        get(task.uri + '/associations', {
                            type: 'depends,child,parent',
                            inout: true
                        }, function(err, items: cb.TAssociation[]) {
                            task.associations = items;
                            items.forEach(function(associ) {
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
                async.parallelLimit(parallel, concurrentCount, function(err) {
                    cb(err);
                });
            });

            series.push(function(cb) {
                progress('getting tasks and its associations outside project');
                var parallel = [];
                console.log(additionalTaskUris.length);
                additionalTaskUris.forEach(function(uri: string) {
                    parallel.push(function(cb) {
                        get(uri, null, function(err, item: cb.TTask) {
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
                            }, function(err, associations) {
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
                async.parallelLimit(parallel, concurrentCount, function(err) {
                    cb(err);
                });
            });

            async.series(series, function(err) {
                aCb(err, trackerUriList, tasks);
            });
        },
        getReleases: function(aParam: cb.TParamGetRelease, aCb:(err, trackerUriList: string[], resp?: cb.TRelease[]) => void) {

            var projectUri = aParam.projectUri;
            var series = [];

            // get uri for task
            var trackerUriList = [];
            series.push(function(cb) {
                get(projectUri + '/categories', {
                    type: 'Release'
                }, function(err, items) {

                    items.forEach(function(item) {
                        if (item.uri) {
                            trackerUriList.push(item.uri);
                        }

                        // when base uri is /user/[id]
                        if (item.trackers) {
                            item.trackers.forEach(function(tracker) {
                                trackerUriList.push(tracker.uri);
                            });
                        }
                    });

                    cb(err);
                });
            });

            // get trackers all items
            var releases: cb.TRelease[] = [];
            series.push(function(cb) {
                var parallel = [];
                trackerUriList.forEach(function(trackerUri) {
                    parallel.push(function(cb) {
                        get(trackerUri + '/items', null, function(err, items: cb.TTask[]) {
                            releases = releases.concat(items);
                            cb(err);
                        });
                    });
                });
                async.parallelLimit(parallel, concurrentCount, function(err) {
                    cb(err);
                });
            });

            async.series(series, function(err) {
                aCb(err, trackerUriList, releases);
            });
        },
        createTask: function(aParam: cb.TParamCreateTask, aCb:(err, resp?: cb.TTask) => void) {
            post('/item', aParam, function(err, resp) {
                if (err) {
                    aCb(err);
                    return;
                }
                get(resp.uri, null, aCb);
            });
        },
        updateTask: function(aTask: cb.TTask, aCb: (err, resp?: cb.TTask) => void) {
            put('/item', aTask, function(err, resp) {
                if (err) {
                    aCb(err);
                    return;
                }
                get(aTask.uri, null, aCb);
            });
        },
        deleteTask: function (aTaskUri: string, aCb: (err, resp) => void) {
            del(aTaskUri, aCb);
        },
        createAssociation: function(aParam: cb.TParamCreateAssociation, aCb:(err) => void) {
            aParam.type = aParam.type || "/association/type/1";
            aParam.propagatingSuspects = aParam.propagatingSuspects || false;
            if (!aParam.description) {
                aParam.description = "Generated by ganttly";
                aParam.descFormat = "Wiki";
            }

            post('/association', aParam, aCb);
        },
        updateAssociation: function(aParam, aCb: (err) => void) {
            put('/association', aParam, aCb);
        },
        deleteAssociation(aAssociationUri: string, aCb:(err, resp) => void) {
            del(aAssociationUri, aCb);
        }
    };

    return codeBeamber;
});

