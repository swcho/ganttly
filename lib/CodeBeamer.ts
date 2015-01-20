

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

        getItemsByCmdb(aCmdbUri: string, aCb: (err, items: any[]) => void) {
            send('GET', aCmdbUri + '/items', null, aCb);
        }

        getItem(aReleaseUri: string, aCb: (err, item: TRelease) => void) {
            send('GET', aReleaseUri, null, aCb);
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

    export class CItemApi extends CRestApi {
        constructor() {
            super(null);
        }

        getItem(aReleaseUri: string, aCb: (err, item: TItem) => void) {
            send('GET', aReleaseUri, null, aCb);
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
    export var item = new CItemApi();
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

    export interface TItemMap {
        [itemUri: string]: Cb.TItem;
    }

    function getItems(aItemUriList: string[], aCb: (err, items: Cb.TItem[], itemMap: TItemMap) => void) {

        console.log('getItems');

        var p = [];
        var items = [];
        var itemMap: TItemMap = {};
        aItemUriList.forEach(function(uri) {
            p.push(function(done) {
               Cb.item.getItem(uri, function(err, i) {
                   items.push(i);
                   itemMap[uri] = i;
                   done(err);
               });
            });
        });

        async.parallel(p, function(err) {
           aCb(err, items, itemMap);
        });
    }

    function getReleases(aReleaseUriList: string[], aCb: (err, releases: Cb.TRelease[], map: TReleaseMap) => void) {

        console.log('getReleases');

        var p = [];
        var releases = [];
        var releaseMap: TReleaseMap = {};
        aReleaseUriList.forEach(function(uri) {
            p.push(function(done) {
                Cb.cmdb.getItem(uri, function(err, r) {
                    releases.push(r);
                    releaseMap[uri] = r;
                    done(err);
                });
            });
        });

        async.parallel(p, function(err) {

            aCb(err, releases, releaseMap);
        });
    }

    function getReleasesByCmdbList(aCmdbList: Cb.TCmdb[], aCb: (err, tasks: Cb.TRelease[]) => void) {

        console.log('getReleasesByCmdbList');

        aCmdbList = aCmdbList || [];
        var p = [];
        var releases = [];
        aCmdbList.forEach(function(cmdb) {
            if (cmdb.type.name == 'Release') {
                p.push(function(done) {
                    Cb.cmdb.getItemsByCmdb(cmdb.uri, function(err, items) {
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

        console.log('getTasksByTrackers');

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

    function getReleasesByProject(aProjectUri: string, aCb: (err, cmdbMap: TCmdbMap, releases: Cb.TRelease[], releaseMap: TReleaseMap) => void) {

        console.log('getReleasesByProject');

        var s = [];
        var cmdbList;
        var cmdbMap: TCmdbMap = {};
        var releases = [];
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
            getReleasesByCmdbList(cmdbList, function(err, rlist) {
                rlist.forEach(function(r) {
                    releaseMap[r.uri] = r;
                });
                releases = rlist;
                done(err);
            });
        });
        async.series(s, function(err) {
            aCb(err, cmdbMap, releases, releaseMap);
        });
    }

    function getTaskInfoByProject(aProjectUri: string, aCb: (err, trackerMap: TTrackerMap, taskMap: TTaskMap, tasks: Cb.TTask[]) => void) {

        console.log('getTaskInfoByProject');

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

    function populateAssociation(aTasks: Cb.TTask[], aCb: (err, associations: Cb.TAssociation[]) => void) {

        console.log('populateAssociation');

        var p = [];

        var associations = [];

        aTasks.forEach(function(t) {
            p.push(function(done) {
                Cb.association.getAllAssociationByTypes(t.uri, ['depends', 'child', 'parent'], function(err, a) {
                    if (a && a.length) {
                        t._associations = a;
                        associations = associations.concat(a);
                    }
                    done(err);
                });
            });
        });

        async.parallel(p, function(err) {
            aCb(err, associations);
        });
    }

    export interface TCachedProjectInfo {
        cmdbMap: TCmdbMap;
        trackerMap: TTrackerMap;
//        releaseMap: TReleaseMap;
        taskMap: TTaskMap;
        tasks: Cb.TTask[];
    }

    export interface TAllMaps {
        projectMap: TProjectMap;
        userMap: TUserMap;
        releaseMap: TReleaseMap;
        trackerMap: TTrackerMap;
    }

    var KReleaseProps = ['release', '업무구분'];
    function getReleaseUriListFromTask(aTask: Cb.TTask): string[] {
        var i, len = KReleaseProps.length, p, uriList = [];
        for (i=0; i<len; i++) {
            p = KReleaseProps[i];
            if (aTask[p] && aTask[p].length) {
                aTask[p].forEach(function(v) {
                    uriList.push(v.uri)
                });
                return uriList;
            }
        }
        return null;
    }

    export class CCbCache {

        _cache: { [projectUri: string]: TCachedProjectInfo; } = {};
        _projectMap: TProjectMap = {};
        _releaseMap: TReleaseMap = {};
        _userMap: TUserMap = {};

        constructor() {

        }

        getAllMaps(): TAllMaps {

            var trackerMap: TTrackerMap = {};

            Object.keys(this._cache).forEach((projectUri) => {
                var info = this._cache[projectUri];
                if (info) {
                    Object.keys(info.trackerMap).forEach(function(trackerUri) {
                        trackerMap[trackerUri] = info.trackerMap[trackerUri];
                    });
                }
            });

            return {
                projectMap: this._projectMap,
                userMap: this._userMap,
                releaseMap: this._releaseMap,
                trackerMap: trackerMap
            };
        }

        getCachedProjectInfo(aProjectUri: string, aCb: (err, cached: TCachedProjectInfo) => void) {

            console.log('getCachedProjectInfo');

            if (this._cache[aProjectUri]) {
                aCb(null, this._cache[aProjectUri]);
                return;
            }

            var s = [];

            var project: Cb.TProject;
            var cmdbMap: TCmdbMap;
            var trackerMap: TTrackerMap;
            var releases: Cb.TRelease[];
            var releaseMap: TReleaseMap;
            var taskMap: TTaskMap = {};
            var tasks: Cb.TTask[] = [];

            s.push(function(done) {
                Cb.project.getProject(aProjectUri, function (err, p) {
                    project = p;
                    done(err);
                });
            });

            s.push(function(done) {
                getReleasesByProject(aProjectUri, function (err, cmap, rlist, rmap) {
                    cmdbMap = cmap;
                    releases = rlist;
                    releaseMap = rmap;
                    done();
                });
            });

            var external_releases = [];
            s.push(function(done) {
                getTaskInfoByProject(aProjectUri, function(err, trkM, tm, ts) {
                    trackerMap = trkM;
                    taskMap = tm;
                    tasks = ts;

                    tasks.forEach(function(t) {
                        var releaseUriList = getReleaseUriListFromTask(t);
                        if (releaseUriList) {
                            releaseUriList.forEach(function(uri) {
                                if (!releaseMap[uri]) {
                                    external_releases.push(uri);
                                }
                            });
                        }
                    });

                    done(err);
                });
            });

            s.push(function(done) {
                getReleases(external_releases, function(err, rlist, rmap) {
                    releases = releases.concat(rlist);
                    done(err);
                });
            });

            var itemsMap = {};
            s.push(function(done) {
                populateAssociation(tasks, function(err, alist) {

                    alist.forEach(function(a) {

                        if (a.from) {
                            itemsMap[a.from.uri] = null;
                        }

                        if (a.to) {
                            itemsMap[a.to.uri] = null;
                        }

                    });

                    done(err);
                });
            });

            s.push(function(done) {
                getItems(Object.keys(itemsMap), function(err, ilist, imap) {
                    itemsMap = imap;
                    done();
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

                this._projectMap[aProjectUri] = project;

                var ret: TCachedProjectInfo = {
                    cmdbMap: cmdbMap,
                    trackerMap: trackerMap,
                    releaseMap: releaseMap,
                    taskMap: taskMap,
                    tasks: tasks
                };

                releases.forEach((r) => {
                    this._releaseMap[r.uri] = r;
                });

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
            var name = aUser.name;
            if (aUser.firstName) {
                name = aUser.firstName;
                var match = reName.exec(aUser.firstName);
                if (match) {
                    name = match[1];
                }
            }

            return name;
        }

        function covertCbTaskToDhxTask(aAllMaps: TAllMaps, aCbTask: Cb.TTask, aParentUri?: string): DhxGantt.TTask {
            var dhxTask: DhxGantt.TTask = {
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

        function convertCbTasksToDhxTasks(aAllMaps: TAllMaps, aCbTasks: Cb.TTask[], aParentUri?: string): DhxGantt.TTask[] {
            var dhxTasks = [];
            aCbTasks.forEach(function(cbTask) {
                dhxTasks.push(covertCbTaskToDhxTask(aAllMaps, cbTask, aParentUri));
            });
            return dhxTasks;
        }

        interface TGroupTask extends DhxGantt.TTask {
            groupType?: TGroupType;
            child?: TGroupTask[];
        }

//        interface FnInnerGroupingHandlers {
//            (allMaps: TAllMaps): TGroupTask[];
//        }
//
//        var KInnerGroupingHandlers: { [type: TGroupType]: FnInnerGroupingHandlers } = {};
//        KInnerGroupingHandler[TGroupType.BySprint] = function(aAllMaps: TAllMaps): TGroupTask[] {
//            var ret: TGroupTask[] = [];
//
//            return ret;
//        };

        var KUnknownIdentifier = 'UNKNOWN';
        var KGroupKeyIdentifiers = {};
        KGroupKeyIdentifiers[TGroupType.ByUser] = function(aAllMaps: TAllMaps, aTask: Cb.TTask) {
            var ret = KUnknownIdentifier;
            if (aTask.assignedTo) {
                ret = aTask.assignedTo[0].uri;
                if (aTask.assignedTo.length != 1) {
                    console.warn('More than one user');
                    console.warn(aTask);
                }
            }
            return ret;
        };
        KGroupKeyIdentifiers[TGroupType.ByProject] = function(aAllMaps: TAllMaps, aTask: Cb.TTask) {
            return aAllMaps.trackerMap[aTask.tracker.uri].project.uri;
        };
        KGroupKeyIdentifiers[TGroupType.BySprint] = function(aAllMaps: TAllMaps, aTask: Cb.TTask) {
            var ret = KUnknownIdentifier;
            var releaseUriList = getReleaseUriListFromTask(aTask);
            if (releaseUriList) {
                ret = releaseUriList[0];
                if (releaseUriList.length != 1) {
                    console.warn('More than one release');
                    console.warn(aTask);
                }
            }
            return ret;
        };

        var KGroupConverters = {};
        KGroupConverters[TGroupType.ByUser] = function(aAllMaps: TAllMaps, aUserUri: string): DhxGantt.TTask {
            var user = aAllMaps.userMap[aUserUri];
            return {
                id: user.uri,
                text: getUserName(user),
                user: '-',
                _type: DhxGanttDef.TTaskType.User
            };
        };
        KGroupConverters[TGroupType.ByProject] = function(aAllMaps: TAllMaps, aProjectUri: string): DhxGantt.TTask {
            var project = aAllMaps.projectMap[aProjectUri];
            console.log(project);
            return {
                id: project.uri,
                text: project.name,
                user: '-',
                _type: DhxGanttDef.TTaskType.Project
            };
        };
        KGroupConverters[TGroupType.BySprint] = function(aAllMaps: TAllMaps, aReleaseUri: string, aParentId?: string): DhxGantt.TTask {
            var release = aAllMaps.releaseMap[aReleaseUri];
            console.log(release);
            var ret: DhxGantt.TTask = {
                id: release.uri,
                text: release.name,
                user: '-',
                _type: DhxGanttDef.TTaskType.Sprint
            };
            if (release.parent) {
                var parentId = aParentId ? aParentId + '>' : '';
                ret.parent = parentId + release.parent.uri;
            }
            return ret;
        };

        var KUnknownConverter = {};
        KUnknownConverter[TGroupType.ByUser] = function() {
            return {
                id: '__unknown_user__',
                text: 'User not assigned',
                user: '-',
                _type: DhxGanttDef.TTaskType.User
            };
        };
        KUnknownConverter[TGroupType.ByProject] = function() {
            return null;
        };
        KUnknownConverter[TGroupType.BySprint] = function() {
            return {
                id: '__unknown_release__',
                text: 'Relase not assigned',
                user: '-',
                _type: DhxGanttDef.TTaskType.Sprint
            };
        };

        function processGrouping(aAllMaps: TAllMaps, aTasks: Cb.TTask[], aGroupings: TGroupType[], aDepth: number, aParentId?: string): TGroupTask[] {
            var type = aGroupings[aDepth];
            var ret = [];
            if (type) {
                console.log('processGrouping: ' + aDepth + ':' + type);

                var groupKeyIdentifier = KGroupKeyIdentifiers[type];
                var map = {};
                aTasks.forEach(function(t) {
                    var key = groupKeyIdentifier(aAllMaps, t);
                    if (map[key]) {
                        map[key].push(t);
                    } else {
                        map[key] = [t];
                    }
                });

                var groupConverter = KGroupConverters[type];
                var unknownTask: TGroupTask = KUnknownConverter[type]();
                Object.keys(map).forEach(function(key) {

                    var task: TGroupTask;
                    if (key == KUnknownIdentifier) {
                        task = unknownTask;
                    } else {
                        task = groupConverter(aAllMaps, key, aParentId);
                    }
                    if (aParentId) {
                        task.parent = aParentId;
                        task.id = aParentId + '>' + task.id;
                    }
                    task.child = processGrouping(
                        aAllMaps,
                        map[key],
                        aGroupings,
                        aDepth + 1,
                        task.id);
                    ret.push(task);
                });

            } else {
                ret = convertCbTasksToDhxTasks(aAllMaps, aTasks, aParentId);
            }
            return ret;
        }

        function getTasks(groupTasks: TGroupTask[]) {
            var tasks: DhxGantt.TTask[] = [];
            groupTasks.forEach(function(t) {
                tasks.push(t);
                if (t.child) {
                    tasks = tasks.concat(getTasks(t.child));
                }
            });
            return tasks;
        }

        export function getDhxDataByProject(
                aProjectUri: string,
                aGroupings: TGroupType[],
                aCb: (err, aDhxData: DhxGantt.TData, aDhxMarkerList: DhxGantt.TMarker[]) => void ) {

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

                var groupTasks = processGrouping(allMaps, cachedProjectInfo.tasks, aGroupings, 0);

                tasks = getTasks(groupTasks);

                done();
            });

            async.series(s, function(err) {

                var date_to_str = gantt.date.date_to_str(gantt.config.task_date);

                var markers: DhxGantt.TMarker[] = [{
                    start_date: new Date(),
                    css: 'today',
                    title:date_to_str( new Date()),
                    text: 'Today'
                }];

//                Object.keys(cachedProjectInfo.releaseMap).forEach(function(releaseUri) {
//                    var release = cachedProjectInfo.releaseMap[releaseUri];
//                    var date = release.plannedReleaseDate ? new Date(release.plannedReleaseDate): new Date(release.modifiedAt);
//                    markers.push({
//                        start_date: date,
//                        css: "release",
//                        title: date_to_str(date),
//                        text: release.name
//                    });
//                });

                aCb(err, {
                    data: tasks,
                    links: []
                }, markers);
            });

        }
    }
}
