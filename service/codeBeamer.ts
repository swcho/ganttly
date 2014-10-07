
/// <reference path="../typings/tsd.d.ts"/>

/**
 * codeBeamer definitions
 */

declare module cb {

    interface TItem {
        uri: string;
        name: string;
    }

    interface TParamGetProjectList {
        page: number;
        pagesize?: number; // default is 100
        category?: string;
        filter?: string;
    }

    interface TProject extends TItem {
        description: string;
        descFormat: string;
        category: string;
        closed: boolean;
        deleted: boolean;
    }

    interface TRespGetProjectList {
        page: number;
        size: number;
        total: number;
        projects: TProject[];
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
    }

    interface TUser extends TItem {

    }

    interface TEnum {
        flags: number;
        id: number;
        name: string;
    }

    interface TTask extends TItem {
        descFormat: string;
        estimatedMillis: number;
        modifiedAt: string; // Date
        modifier: TUser;
        priority: TEnum;
        startDate: string; // Date
        status: TEnum;
        submittedAt: string; // Date
        submitter: TUser;
        tracker: TTracker;
        version: number;
        parent?: TItem;

        associations?: TAssociation[];
    }

    interface TAssociation extends TItem {
        from: TItem; // uri
        to: TItem; // uri
        type: any; // uri
        propagatingSuspects: boolean;
        description: string;
        descFormat: string;
    }

    interface TParamCreateAssociation {
        from: string; // uri
        to: string; // uri
        type?: string; // ex) "/association/type/depends"
        propagatingSuspects?: boolean;
        description?: string;
        descFormat?: string;
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
        getProjectList(aParam: TParamGetProjectList, aCb:(err, resp?: TRespGetProjectList) => void);
        getProjectTask(aProjectUri: string, aCb:(err, trackerUri: string, resp?: TTask[]) => void);
        createTask(aParam: TParamCreateTask, aCb:(err, resp: TTask) => void);
        updateTask(aTask: cb.TTask, aCb: (err, resp: cb.TTask) => void);
        deleteTask(aTaskUri: string, aCb: (err, resp) => void);
        createAssociation(aParam: TParamCreateAssociation, aCb:(err, resp?: TAssociation) => void);
    }
}

declare var gConfig;

angular.module('ganttly').factory('$codeBeamer',function($http: ng.IHttpService) {

    var host = gConfig.cbBaseUrl;
    var user = gConfig.cbUser;
    var pass = gConfig.cbPass;
    var withCredentials = false;
    var credentials;
    if (user && pass) {
        withCredentials = true;
        credentials = btoa(user + ':' + pass);
    }

    function send(aMethod, aUrl, aParam, aCb) {
        var url = host + aUrl;
        console.log(url);
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
        getProjectList: function(aParam: cb.TParamGetProjectList, aCb: (err, resp?: cb.TRespGetProjectList) => void) {
            get('/projects/page/' + aParam.page, aParam, aCb);
        },
        getProjectTask: function(aProjectUri: string, aCb: (err, trackerUri: string, resp?: cb.TTask[]) => void) {

            console.log('Project URI: ' + aProjectUri);
            var series = [];

            // get uri for task
            var trackerUri;
            series.push(function(cb) {
                get(aProjectUri + '/trackers', {
                    type: 'Task'
                }, function(err, trackers: cb.TTracker[]) {
                    if (trackers && trackers.length) {
                        trackerUri = trackers[0].uri;
                        console.log('Tracker URI: ' + trackers[0].uri);
                    }
                    cb(err);
                });
            });

            // get trackers all items
            var tasks: cb.TTask[];
            series.push(function(cb) {
                get(trackerUri + '/items', null, function(err, items: cb.TTask[]) {
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
                            type: 'depends,child'
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
                aCb(err, trackerUri, tasks);
            });
        },
        createTask: function(aParam: cb.TParamCreateTask, aCb:(err, resp: cb.TTask) => void) {
            post('/item', aParam, aCb);
        },
        updateTask: function(aTask: cb.TTask, aCb: (err, resp: cb.TTask) => void) {
            put('/item', aTask, aCb);
        },
        deleteTask: function (aTaskUri: string, aCb: (err, resp) => void) {
            del(aTaskUri, aCb);
        },
        createAssociation: function(aParam: cb.TParamCreateAssociation, aCb:(err) => void) {
            aParam.type = aParam.type || "/association/type/1";
            aParam.propagatingSuspects = aParam.propagatingSuspects || false;
            if (!aParam.description) {
                aParam.description = "Generated by ganttly";
                aParam.descFormat = "Plain";
            }

            post('/association', aParam, aCb);
        },
        updateAssociation: function(aParam, aCb: (err) => void) {
            put('/association', aParam, aCb);
        }
    };

    return codeBeamber;
});
