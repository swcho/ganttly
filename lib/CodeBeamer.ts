

/// <reference path='../typings/tsd.d.ts'/>
/// <reference path="../directive/dhxGantt/dhxGantt.ts"/>

declare var Http;
declare var gConfig;

module Cb {

    export interface TUser {
        uri?: string;
        name: string;
        title?: string;
        firstName: string;
        lastName: string;
        company?: string;
        address?: string;
        zip?: string;
        city?: string;
        state?: string;
        country?: string;
        dateFormat?: string;
        timeZone?: string;
        language?: string;
        email: string;
        phone?: string;
        mobile?: string;
        skills?: string;
        registryDate?: string;
        status?: TUserStatus;
    }

    export enum TUserStatus{
        EInActivation,
        EActivated,
        EDisabled,
    }

    export interface TRole {
        uri?: string;
        name: string;
        description?: string;
    }

    /**
     * Project
     */

    export interface TProject {
        uri?: string;
        name: string;
        description: string;
        descFormat?: TProjectDescFormat;
        category?: TProjectCategory;
        startDate?: string;
        endDate?: string;
        status?: string;
        closed?: boolean;
        deleted?: boolean;
        keyName?: string;
        template?: boolean;
        propagation?: TProjectPropagation;
        defaultMemberRoleId?: number;
        hiddenMenuItems?: TProjectHiddenMenuItems;
        version?: number;
        createdAt?: string;
        createdBy?: TUser;
        lastModifiedAt?: string;
        lastModifiedBy?: TUser;
    }
    export enum TProjectDescFormat{
        EPlain,
        EHtml,
        EWiki,
    }
    export enum TProjectCategory{
        ECommunications,
        ECollaborative,
        EDatabase,
        EDesktop,
        EEducation,
        EInternet,
        EMultimedia,
        EOffice,
        EPrinting,
        EScrum,
        ESystemDevelopment,
        EEditors,
        EOther,
    }
    export enum TProjectPropagation{
        EPrivate,
        EPublicWithJoinApproval,
        EPublicWithoutApproval,
    }
    export enum TProjectHiddenMenuItems{
        EWiki,
        EDocuments,
        ETrackers,
        EConfigItems,
        EReports,
        EForums,
        EChats,
        ESCMRepositories,
    }

    /**
     *
     */

    export interface TTracker {
        uri?: string;
        name: string;
        project: TProject;
        description?: string;
        descFormat?: TTrackerDescFormat;
        keyName: string;
        type: any; // TODO: find TTrackerType
        templateId?: number;
        workflow?: boolean;
        visible?: boolean;
        template?: boolean;
        attributes?: any;
        createdAt?: string;
        createdBy?: TUser;
        lastModifiedAt?: string;
        lastModifiedBy?: TUser;
        version?: number;
        comment?: string;
    }
    export enum TTrackerDescFormat{
        EPlain,
        EHtml,
        EWiki,
    }

    /**
     *
     */

    export interface TEnum {
        flags: number;
        id: number;
        name: string;
        style?: string; // color code
    }

    export interface TItem {
        uri: string;
        name: string;
    }

    export interface TTask extends TItem {
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
        _associations: TAssociation[];
    }

    export interface TRelease extends TItem {
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

    export interface TAssociation extends TItem {
        from: TItem; // uri
        to: TItem; // uri
        type: any; // uri
        propagatingSuspects: boolean;
        description: string;
        descFormat: string;
    }

    export interface TPage {
        page: number;
        size: number;
        total: number;
    }

    export interface TItemsPage extends TPage {
        items: any[];
    }

    export interface TProjectsPage extends TPage {
        projects: TProject[];
    }

    export interface TUsersPage extends TPage {
        users: TUser[];
    }

    var host = gConfig.cbBaseUrl + '/rest';
    var cbUser = gConfig.cbUser;
    var pass = gConfig.cbPass;
    var concurrentCount = gConfig.concurrentCount || 5;
    var withCredentials = false;
    var credentials;
    if (cbUser && pass) {
        withCredentials = true;
        credentials = btoa(cbUser + ':' + pass);
    }

    function encodeQueryData(data) {
        var ret = [];
        for (var d in data)
            ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
        return ret.join("&");
    }

    function send(aMethod: string, aUrl, aParam, aCb) {
        var url = host + aUrl;
        console.info(aMethod + ': ' + url);
        var options: any  = {};
        options.url = url;
        if (aParam) {
            if (aMethod === 'POST' || aMethod === 'PUT') {
                options.body = aParam;
            } else {
                options.url = url + '?' + encodeQueryData(aParam);
            }
        }
        if (withCredentials) {
            options.withCredentials = true;
            options.headers = {
                'Authorization': 'Basic ' + credentials
            }
        }

        var promise = Http[aMethod.toLowerCase()](options);
        promise.then(function(resp) {
            aCb(null, resp.body);
        });
        promise.catch(function(err) {
            aCb(err);
        });
    }

    function getPageContainsString(aUri: string, aPageNo: number, aStr: string, aCb: (err, resp) => void) {
        send('GET', aUri + '/page/' + aPageNo, {
            filter: aStr
        }, aCb);
    }

    export class CRestApi {

        private _base: string;

        constructor(aBase: string) {
            this._base = aBase;
        }

        getSchema(aCb) {
            send('GET', '/' + this._base + '/schema', null, aCb);
        }

//        getAll(aCb) {
//            send('GET', '/' + this._base + 's', null, aCb);
//        }
//
//        getPage(aPageNo, aParam, aCb) {
//            send('GET', '/' + this._base + 's/page/' + aPageNo, aParam, aCb);
//        }
    }

    export class CUserApi extends CRestApi {
        constructor() {
            super('user');
        }

        getPage(aPageNo: number, aStr: string, aCb: (err, usersPage: TUsersPage) => void) {
            getPageContainsString('/users', aPageNo, aStr, aCb);
        }

        getByUri(aUserUri: string, aCb: (err, user: TUser) => void) {
            send('GET', aUserUri, null, aCb);
        }
    }

    export class CRoleApi extends CRestApi {
        constructor() {
            super('role');
        }
    }

    export class CProjectApi extends CRestApi {
        constructor() {
            super('project');
        }

        getPage(aPageNo: number, aStr: string, aCb: (err, projectsPage: TProjectsPage) => void) {
            if (aStr.length) {
                aStr = aStr + '*';
            }
            getPageContainsString('/projects', aPageNo, aStr, aCb);
        }

    }

    export class CTrackerTypeApi extends CRestApi {
        constructor() {
            super('tracker/type');
        }
    }

    export class CTrackerApi extends CRestApi {
        constructor() {
            super('tracker');
        }

        /**
         * Get a list of all trackers in a project
         * @param aProjectUri
         * @param aTypes
         */

        getTrackers(aProjectUri: string, aTypes: string[], aCb: (err, trackers: TTracker[]) => void) {
            var typeList = aTypes.join(',');
            var param = null;
            if (typeList.length) {
                param = { type: typeList };
            }
            send('GET', aProjectUri + '/trackers', param, aCb);
        }

        getTaskTrackers(aProjectUri: string, aCb: (err, trackers: TTracker[]) => void) {
            this.getTrackers(aProjectUri, ['Task'], aCb);
        }

        getItems(aTrackerUri: string, aCb: (err, itemsPage: any[]) => void) {
            send('GET', aTrackerUri + '/items', null, aCb);
        }

        /**
         * Get a page of tracker items
         */
        getItemsPage(aTrackerUri: string, aPage: number, aCb: (err, itemsPage: TItemsPage) => void) {
            send('GET', aTrackerUri + '/items/page/' + aPage, null, aCb);
        }
    }

    export class CTrackerItemApi extends CRestApi {
        constructor() {
            super(null);
        }
    }

    export class CAssociationApi extends CRestApi {
        constructor() {
            super(null);
        }

        getAllAssociation(aItemUri: string, aCb: (err, associations: TAssociation[]) => void) {
            send('GET', aItemUri + '/associations', {
                inout: true
            }, aCb);
        }

        getAllAssociationByTypes(aItemUri: string, aTypes: string[], aCb: (err, associations: TAssociation[]) => void) {
            send('GET', aItemUri + '/associations', {
                type: aTypes.join(','),
                inout: true
            }, aCb);
        }
    }

    export var user = new CUserApi();
    export var role = new CRoleApi();
    export var project = new CProjectApi();
    export var trackerType = new CTrackerTypeApi();
    export var tracker = new CTrackerApi();
    export var association = new CAssociationApi();
}

module CbUtils {
    function capitaliseFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function schemaToTypeScript(typeName: string, schema) {
        var buf = 'export interface T' + typeName + ' {\n';
        var bufEnum = '';
        Object.keys(schema.properties).forEach(function(key) {
            var attr = schema.properties[key];
            var name = key;
            if (schema.required.indexOf(key) == -1) {
                name = name + '?'
            }

            if (attr.enum) {
                var enumName = 'T' + typeName + capitaliseFirstLetter(key);
                bufEnum += 'export enum ' + enumName + '{\n';
                attr.enum.forEach(function(str: string) {
                    var enumValue = 'E';
                    str.split(' ').forEach(function(s) {
                        enumValue += capitaliseFirstLetter(s);
                    });
                    bufEnum += enumValue + ',\n'
                });
                bufEnum += '}\n';
                buf = buf + name + ': ' + enumName + ';\n';
            } else {
                var type = attr.type;
                if (type == 'integer') {
                    type = 'number';
                } else if (type == 'map') {
                    type = 'any';
                }
                buf = buf + name + ': ' + type + ';\n';
            }

        });
        buf = buf + '}';
        console.log(buf);
        console.log(bufEnum);
    }

//    Cb.user.getSchema(function(err, resp) {
//        schemaToTypeScript('User', resp);
//    });
//
//    Cb.user.getPage(1, 'cho', function(err, resp) {
//        console.log(resp);
//    });

//    Cb.role.getSchema(function(err, resp) {
//        schemaToTypeScript('Role', resp);
//    });

//    Cb.project.getSchema(function(err, resp) {
//        schemaToTypeScript('Project', resp);
//    });

//    Cb.trackerType.getSchema(function(err, resp) {
//        schemaToTypeScript('TrackerType', resp);
//    });

//    Cb.tracker.getSchema(function(err, resp) {
//        schemaToTypeScript('Tracker', resp);
//    });

//    Cb.trackerType.getAll(function(err, resp) {
//        console.log(resp);
//    });

//    Cb.tracker.getTaskTrackers('/project/81', function(err, trackers) {
//        console.log(trackers);
//    });

//    Cb.tracker.getItemsPage('/tracker/3802', 1, function(err, items) {
//        console.log(items);
//    });


    function getTasksByTrackers(aTrackers: Cb.TTracker[], aCb: (err, tasks: Cb.TTask[]) => void) {
        aTrackers = aTrackers || [];
        var p = [];
        var tasks = [];
        aTrackers.forEach(function(tracker) {
            if (tracker.type.name == 'Task') {
                p.push(function(done) {
                    Cb.tracker.getItems(tracker.uri, function(err, items) {
                        tasks = tasks.concat(items);
                        done(err);
                    });
                });
            }
        });

        async.parallel(p, function(err) {
            aCb(err, tasks);
        });
    }

    export interface TTaskMap {
        [taskUri: string]: Cb.TTask;
    }

    function getTaskMapAndListByProject(aProjectUri: string, aCb: (err, taskMap: TTaskMap, tasks: Cb.TTask[]) => void) {

        console.log('getTaskMapAndListByProject');

        var s = [];
        var task_trackers;
        var taskMap: TTaskMap = {};
        var tasks = [];
        s.push(function(done) {
            Cb.tracker.getTaskTrackers(aProjectUri, function(err, trackers) {
                task_trackers = trackers;
                done(err);
            });
        });
        s.push(function(done) {
            getTasksByTrackers(task_trackers, function(err, ts) {
                ts.forEach(function(t) {
                    taskMap[t.uri] = t;
                    tasks.push(t);
                });
                done(err);
            });
        });
        async.series(s, function(err) {
            aCb(err, taskMap, tasks);
        });
    }

    export interface TUserMap {
        [userUri: string]: Cb.TUser;
    }

    function getUsersMapFromTasks(aTasks: Cb.TTask[], aCb: (err, users: TUserMap ) => void) {

        console.log('getUsersMapFromTasks');

        var userMap: TUserMap = {};

        aTasks.forEach(function(task) {
            if (task.assignedTo) {
                task.assignedTo.forEach(function(u) {
                    userMap[u.uri] = null;
                });
            }
        });

        var p = [];
        Object.keys(userMap).forEach(function(key) {
            p.push(function(done) {
                Cb.user.getByUri(key, function(err, user) {
                    userMap[key] = user;
                    done(err);
                });
            });
        });

        async.parallel(p, function(err) {
            aCb(err, userMap);
        });

    }

    function populateAssociation(aTasks: Cb.TTask[], aCb: (err) => void) {

        console.log('populateAssociation');

        var p = [];

        aTasks.forEach(function(t) {
            p.push(function(done) {
                Cb.association.getAllAssociationByTypes(t.uri, ['depends', 'child', 'parent'], function(err, a) {
                    if (a && a.length) {
                        t._associations = a;
                    }
                    done(err);
                });
            });
        });

        async.parallel(p, function(err) {
            aCb(err);
        });
    }

    export interface TCachedProjectInfo {
        taskMap: TTaskMap;
        tasks: Cb.TTask[];
        userMap: TUserMap;
    }

    export class CCbCache {

        _cache: { [projectUri: string]: TCachedProjectInfo; } = {};

        constructor() {

        }

        getCachedProjectInfo(aProjectUri: string, aCb: (err, cached: TCachedProjectInfo) => void) {

            console.log('getCachedProjectInfo');

            if (this._cache[aProjectUri]) {
                aCb(null, this._cache[aProjectUri]);
                return;
            }

            var s = [];

            var taskMap: TTaskMap = {};
            var tasks: Cb.TTask[] = [];
            s.push(function(done) {
                getTaskMapAndListByProject(aProjectUri, function(err, tm, ts) {
                    taskMap = tm;
                    tasks = ts;
                    done(err)
                });
            });

            s.push(function(done) {
                populateAssociation(tasks, function(err) {
                    done(err);
                });
            });

            var userMap: TUserMap = {};
            s.push(function(done) {
                getUsersMapFromTasks(tasks, function(err, resp) {
                    userMap = resp;
                    done(err);
                });
            });

            async.series(s, (err) => {

                var ret: TCachedProjectInfo = {
                    taskMap: taskMap,
                    tasks: tasks,
                    userMap: userMap
                };

                this._cache[aProjectUri] = ret;

                aCb(err, ret);
            });
        }

    }

    export var cache = new CCbCache();

    export module UiUtils {
        var unitDay = 1000 * 60 * 60 * 24;
        var unitHour = 1000 * 60 * 60;
        var unitWorkingDay = gConfig.workingHours ? gConfig.workingHours * unitHour: unitDay;
        var holidayAwareness = gConfig.holidayAwareness;
        var reName = /^(.*)\(/;

        function getUserName(aUser: Cb.TUser) {
            console.log(aUser);
            var match = reName.exec(aUser.firstName);
            return match ? match[1]: aUser.name;
        }

        function covertCbTaskToDhxTask(aUserMap: TUserMap, aCbTask: Cb.TTask, parentUri?: string): dhx.TTask {
            var dhxTask: dhx.TTask = {
                id: aCbTask.uri,
                text: aCbTask.name,
                start_date: new Date(aCbTask.startDate || aCbTask.modifiedAt),
                progress: aCbTask.spentEstimatedHours || 0,
                priority: aCbTask.priority ? aCbTask.priority.name: 'Noraml',
                status: aCbTask.status ? aCbTask.status.name: 'None',
                estimatedMillis: aCbTask.estimatedMillis,
                estimatedDays: Math.ceil(aCbTask.estimatedMillis / unitWorkingDay)
            };

            var userNames = [];
            var userIdList = [];
            if (aCbTask.assignedTo) {
                aCbTask.assignedTo.forEach(function(user) {
                    userNames.push(getUserName(aUserMap[user.uri]));
                    userIdList.push(user.uri);
                });
            }
            dhxTask.user = userNames.join(',');
            dhxTask._userIdList = userIdList;

            if (aCbTask.endDate) {
                dhxTask.end_date = new Date(aCbTask.endDate);
            }

            // This is required to display adjustment icon
            if (!dhxTask.duration || dhxTask.duration < 1) {
                dhxTask.duration = 1;
            }

            if (parentUri) {
                dhxTask.parent = parentUri;
            } else if (aCbTask.parent) {
                dhxTask.parent = aCbTask.parent.uri;
            }

            // color
            console.log(aCbTask);
            if (aCbTask.status.style) {
                console.error(aCbTask.status.style);
                dhxTask.color = aCbTask.status.style;
            } else {
                var default_color = {
                    'New': '#b31317',
                    'In progress': '#ffab46',
                    'Partly completed': '',
                    'Completed': '#00a85d',
                    'Suspended': '#00a85d'
                };
                dhxTask.color = default_color[aCbTask.status.name];
            }

            return dhxTask;
        }

        function convertCbTasksToDhxData(aUserMap: TUserMap, aCbTasks: Cb.TTask[]): dhx.TData {
            var dhxTasks = [];
            aCbTasks.forEach(function(cbTask) {
                dhxTasks.push(covertCbTaskToDhxTask(aUserMap, cbTask));
            });
            return {
                data: dhxTasks,
                links: []
            };
        }

        export function getDhxDataByProject(aProjectUri: string, aCb: (err, aDhxData: dhx.TData) => void ) {

            cache.getCachedProjectInfo(aProjectUri, function(err, cached) {
                console.log('getDhxDataByProject');
                aCb(err, convertCbTasksToDhxData(cached.userMap, cached.tasks));
            });
        }
    }
}
