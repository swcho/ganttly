

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

    export interface TCmdb {
        uri?: string;
        name: string;
        type: any;
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
        release?: TRelease[];
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

        getProject(aProjectUri: string, aCb: (err, project: TProject) => void) {
            send('GET', aProjectUri, null, aCb);
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

    export class CCmdbApi extends CRestApi {
        constructor() {
            super(null);
        }

        getReleaseCmdbList(aProjectUri, aCb: (err, cmdbList: TCmdb[]) => void) {
            send('GET', aProjectUri + '/categories', {
                type: 'Release'
            }, aCb);
        }

        getItems(aCmdbUri: string, aCb: (err, items: any[]) => void) {
            send('GET', aCmdbUri + '/items', null, aCb);
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

        getItems(aTrackerUri: string, aCb: (err, items: any[]) => void) {
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
    export var cmdb = new CCmdbApi();
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

    export interface TProjectMap {
        [projectUri: string]: Cb.TProject;
    }

    export interface TUserMap {
        [userUri: string]: Cb.TUser;
    }

    export interface TCmdbMap {
        [trackerUri: string]: Cb.TCmdb;
    }

    export interface TTrackerMap {
        [trackerUri: string]: Cb.TTracker;
    }

    export interface TTaskMap {
        [taskUri: string]: Cb.TTask;
    }

    export interface TReleaseMap {
        [releaseUri: string]: Cb.TRelease;
    }

    function getReleaseByCmdbList(aCmdbList: Cb.TCmdb[], aCb: (err, tasks: Cb.TRelease[]) => void) {
        aCmdbList = aCmdbList || [];
        var p = [];
        var releases = [];
        aCmdbList.forEach(function(cmdb) {
            if (cmdb.type.name == 'Release') {
                p.push(function(done) {
                    Cb.cmdb.getItems(cmdb.uri, function(err, items) {
                        releases = releases.concat(items);
                        done(err);
                    });
                });
            }
        });

        async.parallel(p, function(err) {
            aCb(err, releases);
        });
    }

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

    function getReleasesByProject(aProjectUri: string, aCb: (err, cmdbMap: TCmdbMap, releaseMap: TReleaseMap) => void) {

        console.log('getReleasesByProject');

        var s = [];
        var cmdbList;
        var cmdbMap: TCmdbMap = {};
        var releaseMap: TReleaseMap = {};
        s.push(function(done) {
            Cb.cmdb.getReleaseCmdbList(aProjectUri, function(err, list) {
                cmdbList = list;
                cmdbList.forEach(function(c) {
                    c.project = c.project || <Cb.TProject><any>{ uri: aProjectUri };
                    cmdbMap[c.uri]= c;
                });
                done(err);
            });
        });
        s.push(function(done) {
            getReleaseByCmdbList(cmdbList, function(err, ts) {
                ts.forEach(function(t) {
                    releaseMap[t.uri] = t;
                });
                done(err);
            });
        });
        async.series(s, function(err) {
            aCb(err, cmdbMap, releaseMap);
        });
    }

    function getTaskInfoByProject(aProjectUri: string, aCb: (err, trackerMap: TTrackerMap, taskMap: TTaskMap, tasks: Cb.TTask[]) => void) {

        console.log('getTaskMapAndListByProject');

        var s = [];
        var task_trackers;
        var trackerMap: TTrackerMap = {};
        var taskMap: TTaskMap = {};
        var tasks = [];
        s.push(function(done) {
            Cb.tracker.getTaskTrackers(aProjectUri, function(err, trackers) {
                task_trackers = trackers;
                trackers.forEach(function(t) {
                    t.project = t.project || <Cb.TProject><any>{ uri: aProjectUri };
                    trackerMap[t.uri]= t;
                });
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
            aCb(err, trackerMap, taskMap, tasks);
        });
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
        cmdbMap: TCmdbMap;
        trackerMap: TTrackerMap;
        releaseMap: TReleaseMap;
        taskMap: TTaskMap;
        tasks: Cb.TTask[];
    }

    export interface TAllMaps {
        projectMap: TProjectMap;
        userMap: TUserMap;
        releaseMap: TReleaseMap;
        trackerMap: TTrackerMap;
    }

    export class CCbCache {

        _cache: { [projectUri: string]: TCachedProjectInfo; } = {};
        _projectMap: TProjectMap = {};
        _userMap: TUserMap = {};

        constructor() {

        }

        getAllMaps(): TAllMaps {

            var releaseMap: TReleaseMap = {};
            var trackerMap: TTrackerMap = {};
            Object.keys(this._cache).forEach((projectUri) => {
                var info = this._cache[projectUri];
                if (info) {
                    Object.keys(info.releaseMap).forEach(function(releaseUri) {
                        releaseMap[releaseUri] = info.releaseMap[releaseUri];
                    });
                    Object.keys(info.trackerMap).forEach(function(trackerUri) {
                        trackerMap[trackerUri] = info.trackerMap[trackerUri];
                    });
                }
            });

            return {
                projectMap: this._projectMap,
                userMap: this._userMap,
                releaseMap: releaseMap,
                trackerMap: trackerMap
            }
        }

        getCachedProjectInfo(aProjectUri: string, aCb: (err, cached: TCachedProjectInfo) => void) {

            console.log('getCachedProjectInfo');

            if (this._cache[aProjectUri]) {
                aCb(null, this._cache[aProjectUri]);
                return;
            }

            var s = [];

            var cmdbMap: TCmdbMap;
            var trackerMap: TTrackerMap;
            var releaseMap: TReleaseMap;
            var taskMap: TTaskMap = {};
            var tasks: Cb.TTask[] = [];

            s.push((done) => {
                Cb.project.getProject(aProjectUri, (err, project) => {
                    this._projectMap[aProjectUri] = project;
                    done(err);
                });
            });

            s.push(function(done) {
                getReleasesByProject(aProjectUri, function (err, cm, rm) {
                    cmdbMap = cm;
                    releaseMap = rm;
                    done();
                });
            });

            s.push(function(done) {
                getTaskInfoByProject(aProjectUri, function(err, trkM, tm, ts) {
                    trackerMap = trkM;
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

            s.push((done) => {
                getUsersMapFromTasks(tasks, (err, resp) => {
                    Object.keys(resp).forEach((userUri) => {
                        this._userMap[userUri] = resp[userUri];
                    });
                    done(err);
                });
            });

            async.series(s, (err) => {

                var ret: TCachedProjectInfo = {
                    cmdbMap: cmdbMap,
                    trackerMap: trackerMap,
                    releaseMap: releaseMap,
                    taskMap: taskMap,
                    tasks: tasks
                };

                this._cache[aProjectUri] = ret;

                aCb(err, ret);
            });
        }

    }

    export var cache = new CCbCache();

    export enum TGroupType {
        None,
        ByUser,
        ByProject,
        BySprint
    }

    export module UiUtils {

        var unitDay = 1000 * 60 * 60 * 24;
        var unitHour = 1000 * 60 * 60;
        var unitWorkingDay = gConfig.workingHours ? gConfig.workingHours * unitHour: unitDay;
        var holidayAwareness = gConfig.holidayAwareness;
        var reName = /^(.*)\(/;

        function getUserName(aUser: Cb.TUser) {
            var match = reName.exec(aUser.firstName);
            return match ? match[1]: aUser.name;
        }

        function covertCbTaskToDhxTask(aAllMaps: TAllMaps, aCbTask: Cb.TTask, aParentUri?: string): dhx.TTask {
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
                    userNames.push(getUserName(aAllMaps.userMap[user.uri]));
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

            if (aParentUri) {
                dhxTask.parent = aParentUri;
            } else if (aCbTask.parent) {
                dhxTask.parent = aCbTask.parent.uri;
            }

            // color
            if (aCbTask.status) {
                if (aCbTask.status.style) {
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
            } else {
                dhxTask.color = 'white';
            }

            return dhxTask;
        }

        function convertCbTasksToDhxTasks(aAllMaps: TAllMaps, aCbTasks: Cb.TTask[], aParentUri?: string): dhx.TTask[] {
            var dhxTasks = [];
            aCbTasks.forEach(function(cbTask) {
                dhxTasks.push(covertCbTaskToDhxTask(aAllMaps, cbTask, aParentUri));
            });
            return dhxTasks;
        }

        interface TGroupTask extends dhx.TTask {
            groupType?: TGroupType;
            child?: TGroupTask[];
        }

        var KUnknownIdentifier = 'UNKNOWN';
        var KGroupKeyIndentifiers = {};
        KGroupKeyIndentifiers[TGroupType.ByUser] = function(aAllMaps: TAllMaps, aTask: Cb.TTask) {
            var ret = KUnknownIdentifier;
            if (aTask.assignedTo) {
                ret = aTask.assignedTo[0].uri;
            }
            return ret;
        };
        KGroupKeyIndentifiers[TGroupType.ByProject] = function(aAllMaps: TAllMaps, aTask: Cb.TTask) {
            return aAllMaps.trackerMap[aTask.tracker.uri].project.uri;
        };
        KGroupKeyIndentifiers[TGroupType.BySprint] = function(aAllMaps: TAllMaps, aTask: Cb.TTask) {
            var ret = KUnknownIdentifier;
            if (aTask.release) {
                ret = aTask.release[0].uri;
            }
            return ret;
        };

        var KGroupConverter = {};
        KGroupConverter[TGroupType.ByUser] = function(aAllMaps: TAllMaps, aUserUri: string): dhx.TTask {
            var user = aAllMaps.userMap[aUserUri];
            return {
                id: user.uri,
                text: getUserName(user),
                _type: dhxDef.TTaskType.User
            };
        };
        KGroupConverter[TGroupType.ByProject] = function(aAllMaps: TAllMaps, aProjectUri: string): dhx.TTask {
            var project = aAllMaps.projectMap[aProjectUri];
            return {
                id: project.uri,
                text: project.name,
                _type: dhxDef.TTaskType.Project
            };
        };
        KGroupConverter[TGroupType.BySprint] = function(aAllMaps: TAllMaps, aReleaseUri: string): dhx.TTask {
            var release = aAllMaps.releaseMap[aReleaseUri];
            return {
                id: release.uri,
                text: release.name,
                _type: dhxDef.TTaskType.Sprint
            };
        };

        var KUnknownConverter = {};
        KUnknownConverter[TGroupType.ByUser] = function() {
            return {
                id: '__unknown_user__',
                text: 'Not assigned',
                _type: dhxDef.TTaskType.User
            };
        };
        KUnknownConverter[TGroupType.ByProject] = function() {
            return null;
        };
        KUnknownConverter[TGroupType.BySprint] = function() {
            return {
                id: '__unknown_user__',
                text: 'Not assigned',
                _type: dhxDef.TTaskType.Sprint
            };
        };

        function processGrouping(aAllMaps: TAllMaps, aTasks: Cb.TTask[], aGroupings: TGroupType[], aParentId?: string): TGroupTask[] {
            var type = aGroupings.shift();
            var ret = [];
            if (type) {
                ret = [];
                var groupKeyIdentifier = KGroupKeyIndentifiers[type];
                var map = {};
                aTasks.forEach(function(t) {
                    var key = groupKeyIdentifier(aAllMaps, t);
                    if (map[key]) {
                        map[key].push(t);
                    } else {
                        map[key] = [t];
                    }
                });

                var groupConverter = KGroupConverter[type];
                var unknownTask: TGroupTask = KUnknownConverter[type]();
                Object.keys(map).forEach(function(key) {
                    if (key == KUnknownIdentifier) {
                        unknownTask.child = convertCbTasksToDhxTasks(aAllMaps, map[key], unknownTask.id);
                        ret.push(unknownTask);
                    } else {
                        var task: TGroupTask = groupConverter(aAllMaps, key);
                        task.child = processGrouping(aAllMaps, map[key], aGroupings, task.id);
                        ret.push(task);
                    }
                });

            } else {
                ret = convertCbTasksToDhxTasks(aAllMaps, aTasks, aParentId);
            }
            return ret;
        }

        function getTasks(groupTasks: TGroupTask[]) {
            var tasks: dhx.TTask[] = [];
            groupTasks.forEach(function(t) {
                tasks.push(t);
                if (t.child) {
                    tasks = tasks.concat(getTasks(t.child));
                }
            });
            return tasks;
        }

        export function getDhxDataByProject(aProjectUri: string, aGroupings: TGroupType[], aCb: (err, aDhxData: dhx.TData) => void ) {

            var s = [];

            var cachedProjectInfo;
            s.push(function(done) {
                cache.getCachedProjectInfo(aProjectUri, function(err, cached) {
                    console.log('getDhxDataByProject');

                    cachedProjectInfo = cached;

                    done(err);
                });
            });

            var tasks;
            s.push(function(done) {

                var allMaps = cache.getAllMaps();

                var groupTasks = processGrouping(allMaps, cachedProjectInfo.tasks, aGroupings);

                tasks = getTasks(groupTasks);

                done();
            });

            async.series(s, function(err) {
                aCb(err, {
                    data: tasks,
                    links: []
                });
            });

        }
    }
}
