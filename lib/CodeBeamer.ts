

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

    export enum TItemType {
        Unknown,
        Task,
        Release
    }

    export interface TItem {
        uri: string;
        name: string;
        _associations?: TAssociation[];
        _references?: TItem[];
        _type?: TItemType;
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

        getItem(aItemUri: string, aCb: (err, item: TItem) => void) {
            send('GET', aItemUri, null, aCb);
        }

        getReferences(aItemUri: string, aCb: (err, item: TItem[]) => void) {
            send('GET', aItemUri + '/references', null, aCb);
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

    function getItems(aItemUriList: string[], aCb: (err, items: Cb.TItem[]) => void) {

        console.log('getItems');

        var p = [];
        var items = [];

        aItemUriList.forEach(function(uri) {
            p.push(function(done) {
               Cb.item.getItem(uri, function(err, i) {
                   items.push(i);
                   done(err);
               });
            });
        });

        async.parallel(p, function(err) {
           aCb(err, items);
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

    function getReleasesInfoByProject(aProjectUri: string, aCb: (err, cmdbList: Cb.TCmdb[], releases: Cb.TRelease[], associations: Cb.TAssociation[], outerItemUriList: string[]) => void) {

        console.log('getReleasesInfoByProject');

        var s = [];
        var cmdbList: Cb.TCmdb[];
        var releases = [];
        var associations: Cb.TAssociation[];

        s.push(function(done) {
            Cb.cmdb.getReleaseCmdbList(aProjectUri, function(err, list) {
                cmdbList = list;
                done(err);
            });
        });

        s.push(function(done) {
            getReleasesByCmdbList(cmdbList, function(err, rlist) {
                releases = rlist;
                done(err);
            });
        });

        var outerReleasesUriList: string[];
        s.push(function(done) {
            populateAssociation(releases, function(err, alist) {
                associations = alist;
                var mapRelease = {};
                alist.forEach(function(a) {
                    if (a.type.name == 'derived') {
                        mapRelease[a.to.uri] = null;
                    }
                });
                outerReleasesUriList = Object.keys(mapRelease);
                done(err);
            });
        });

        var outerReleases;
        s.push(function(done) {
            getItems(outerReleasesUriList, function(err, items) {
                releases = releases.concat(items);
                outerReleases = items;
                done(err);
            });
        });

        var outerItemUriList = [];
        s.push(function(done) {
            populateReferences(outerReleases, function(err, references) {
                references.forEach(function(i) {
                    outerItemUriList.push(i.uri);
                });
                done(err);
            });
        });

        async.series(s, function(err) {
            aCb(err, cmdbList, releases, associations, outerItemUriList);
        });
    }

    function getTaskInfoByProject(aProjectUri: string, aCb: (err, trackers: Cb.TTracker[], tasks: Cb.TTask[], associations: Cb.TAssociation[]) => void) {

        console.log('getTaskInfoByProject');

        var s = [];
        var trackers: Cb.TTracker[];
        var tasks: Cb.TTask[];
        var associations: Cb.TAssociation[];

        s.push(function(done) {
            Cb.tracker.getTaskTrackers(aProjectUri, function(err, tlist) {
                trackers = tlist;
                done(err);
            });
        });

        s.push(function(done) {
            getTasksByTrackers(trackers, function(err, tlist) {
                tasks = tlist;
                done(err);
            });
        });

        s.push(function(done) {
            populateAssociation(tasks, function(err, alist) {
                associations = alist;
                done(err);
            });
        });

        async.series(s, function(err) {
            aCb(err, trackers, tasks, associations);
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

    function populateAssociation(aItems: Cb.TItem[], aCb: (err, associations: Cb.TAssociation[]) => void) {

        console.log('populateAssociation');

        var p = [];

        var associations = [];

        aItems.forEach(function(i) {
            p.push(function(done) {
                Cb.association.getAllAssociationByTypes(i.uri, ['depends', 'child', 'parent', 'derived'], function(err, items) {
                    if (items && items.length) {
                        i._associations = items;
                        associations = associations.concat(items);
                    }
                    done(err);
                });
            });
        });

        async.parallel(p, function(err) {
            aCb(err, associations);
        });
    }

    function populateReferences(aItems: Cb.TItem[], aCb: (err, references: Cb.TItem[]) => void) {

        console.log('populateReferences');

        var p = [];

        var references = [];

        aItems.forEach(function(i) {
            p.push(function(done) {
                Cb.item.getReferences(i.uri, function(err, items) {
                    i._references = items;
                    references = references.concat(items);
                    done();
                });
            });
        });

        async.parallel(p, function(err) {
            aCb(err, references);
        });
    }

    interface TProjectInfo {
        releaseCmdbList: Cb.TCmdb[];
        releaseList: Cb.TRelease[];
        taskTrackerList: Cb.TTracker[];
        tasks: Cb.TTask[];
        associations: Cb.TAssociation[];
        outerItemUriList: string[];
    }

    function getProjectInfo(aProjectUri, aCb: (err, projectInfo: TProjectInfo) => void) {

        var p = [];
        var releaseCmdbList: Cb.TCmdb[];
        var releaseList: Cb.TRelease[];
        var outerItemUriList: string[];
        var taskTrackerList: Cb.TTracker[];
        var tasks: Cb.TTask[];
        var associations: Cb.TAssociation[] = [];

        p.push(function(done) {
            getReleasesInfoByProject(aProjectUri, function(err, clist, rlist, alist, urilist) {
                releaseCmdbList = clist;
                releaseList = rlist;
                associations = associations.concat(alist);
                outerItemUriList = urilist;
                done(err);
            });
        });

        p.push(function(done) {
            getTaskInfoByProject(aProjectUri, function(err, trklist, tlist, alist) {
                taskTrackerList = trklist;
                tasks = tlist;
                associations = associations.concat(alist);
                done(err);
            });
        });

        async.parallel(p, function(err) {

            aCb(err, {
                releaseCmdbList: releaseCmdbList,
                releaseList: releaseList,
                taskTrackerList: taskTrackerList,
                tasks: tasks,
                associations: associations,
                outerItemUriList: outerItemUriList
            });

        });

    }

    export interface TCachedProjectInfo {
        releases: Cb.TRelease[];
        tasks: Cb.TTask[];
        outerTasks: Cb.TTask[];
    }

    export interface TAllMaps {
        projectMap: TProjectMap;
        userMap: TUserMap;
        trackerMap: TTrackerMap;
        itemMap: TItemMap;
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
        _userMap: TUserMap = {};
        _projectMap: TProjectMap = {};
        _trackerMap: TTrackerMap = {};
        _itemMap: TItemMap = {};

        constructor() {

        }

        getAllMaps(): TAllMaps {

            return {
                projectMap: this._projectMap,
                userMap: this._userMap,
                trackerMap: this._trackerMap,
                itemMap: this._itemMap
            };
        }

        getCachedProjectInfo(aProjectUri: string, aCb: (err, cached: TCachedProjectInfo) => void) {

            console.log('getCachedProjectInfo');

            if (this._cache[aProjectUri]) {
                aCb(null, this._cache[aProjectUri]);
                return;
            }

            var s = [];

            var itemMap = this._itemMap;

            var release;
            var tasks;
            var userUriList: string[];
            var trackerUriList: string[] = [];
            var outerReleaseUriList;
            var outerItemUriList: string[];
            s.push(function(done) {
                getProjectInfo(aProjectUri, function(err, projectInfo) {

                    release = projectInfo.releaseList;
                    tasks = projectInfo.tasks;
                    outerItemUriList = projectInfo.outerItemUriList;

                    projectInfo.taskTrackerList.forEach(function(t) {
                        trackerUriList.push(t.uri);
                    });

                    projectInfo.releaseList.forEach(function(r) {
                        r._type = Cb.TItemType.Release;
                        itemMap[r.uri] = r;
                    });

                    var mapUser = {};
                    var mapRelease = {};
                    projectInfo.tasks.forEach(function(t) {
                        itemMap[t.uri] = <any>t;

                        if (t.assignedTo) {
                            t.assignedTo.forEach(function(u) {
                                mapUser[u.uri] = null;
                            });
                        }

                        var releaseUriList = getReleaseUriListFromTask(<any>t);
                        if (releaseUriList) {
                            releaseUriList.forEach(function(ruri) {
                                mapRelease[ruri] = null;
                            });
                        }
                    });
                    userUriList = Object.keys(mapUser);
                    outerReleaseUriList = Object.keys(mapRelease);

                    var mapAssociation = {};
                    projectInfo.associations.forEach(function(a) {
                        if (a.from && a.from.uri.indexOf('/item') == 0) {
                            mapAssociation[a.from.uri] = null;
                        }

                        if (a.to && a.to.uri.indexOf('/item') == 0) {
                            mapAssociation[a.to.uri] = null;
                        }
                    });
                    outerItemUriList = outerItemUriList.concat(Object.keys(mapAssociation));
                    done();
                });
            });

            var outerItems;
            var outerTrackerUriList;
            var outerProjectUriList;
            var outerUserUriList;
            s.push(function(done) {
                getItems(outerItemUriList, function(err, ilist) {
                    var mapRelease = {};
                    var mapTracker = {};
                    var mapProject = {};
                    var mapUser = {};
                    ilist.forEach(function(item) {

                        var releaseUriList = getReleaseUriListFromTask(<any>item);
                        if (releaseUriList) {
                            releaseUriList.forEach(function(ruri) {
                                mapRelease[ruri] = null;
                            });
                        }

                        mapTracker[item['tracker'].uri] = null;
                        mapProject[item['tracker'].project.uri] = null;
                        itemMap[item.uri] = item;
                        if (item['assignedTo']) {
                            item['assignedTo'].forEach(function(u) {
                                mapUser[u.uri] = null;
                            });
                        }
                    });
                    outerItems = ilist;
                    outerReleaseUriList = outerReleaseUriList.concat(Object.keys(mapRelease));
                    outerTrackerUriList = Object.keys(mapTracker);
                    outerProjectUriList = Object.keys(mapProject);
                    outerUserUriList = Object.keys(mapUser);
                    done();
                });
            });

            var userMap = this._userMap;
            var projectMap = this._projectMap;
            var trackerMap = this._trackerMap;

            s.push(function(done) {

                async.parallel([
                    function(done) {
                        getItems(outerReleaseUriList, function(err, ilist) {
                            ilist.forEach(function(release) {
                                release._type = Cb.TItemType.Release;
                                itemMap[release.uri] = <Cb.TRelease><any>release;
                            });
                            done();
                        });
                    },
                    function(done) {
                        getItems(trackerUriList.concat(outerTrackerUriList), function(err, ilist) {
                            ilist.forEach(function(tracker) {
                                trackerMap[tracker.uri] = <Cb.TTracker><any>tracker;
                            });
                            done(err);
                        });
                    },
                    function(done) {
                        getItems(userUriList.concat(outerUserUriList), function(err, ilist) {
                            ilist.forEach(function(i) {
                                userMap[i.uri] = <Cb.TUser><any>i;
                            });
                            done();
                        });
                    },
                    function(done) {
                        getItems([aProjectUri].concat(outerProjectUriList), function(err, ilist) {
                            ilist.forEach(function(i) {
                                projectMap[i.uri] = <Cb.TProject><any>i;
                            });
                            done();
                        });
                    }
                ], function(err) {
                    done(err);
                });

            });

            async.series(s, (err) => {

                var outerTasks = [];
                outerItems.forEach((item) => {
                    var tracker = trackerMap[item.tracker.uri];
                    if (tracker.type.name == 'Task') {
                        outerTasks.push(item);
                    }
                });

                var ret: TCachedProjectInfo = {
                    releases: release,
                    tasks: tasks,
                    outerTasks: outerTasks
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

    export enum TFilterType {
        None = 0x00,
        ByWithoutCompletedTask = 0x01,
        ByFromPast2Weeks = 0x02
    }

    export enum TSortingType {
        None,
        ByStartTime,
        ByStartTimeDsc,
        ByEndTime,
        ByEndTimeDsc,
        BySubmittedTime,
        BySubmittedTimeDsc,
        ByModifiedTime,
        ByModifiedTimeDsc
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

        var default_color = {
            'New': '#b31317',
            'In progress': '#ffab46',
            'Partly completed': '#00a85d',
            'Completed': '#187a6d',
            'Closed': '#187a6d',
            'Suspended': '#00a85d',
            'Unreleased': '#ffab46',
            'Released': '#00a85d',
            'End-of-Life': '#187a6d'
        };

        function covertCbItemToDhxTask(aAllMaps: TAllMaps, aCbItem: Cb.TItem, aParentUri?: string): DhxGantt.TTask {

            var cbTask: Cb.TTask = <Cb.TTask>aCbItem;
            var cbRelease: Cb.TRelease = <Cb.TRelease>aCbItem;

            var dhxTask: DhxGantt.TTask = {
                id: cbTask.uri,
                text: cbTask.name,
                start_date: new Date(cbTask.startDate || cbTask.submittedAt),
                progress: cbTask.spentEstimatedHours || 0,
                priority: cbTask.priority ? cbTask.priority.name: 'Normal',
                status: cbTask.status ? cbTask.status.name: 'None',
                estimatedMillis: cbTask.estimatedMillis,
                estimatedDays: Math.ceil(cbTask.estimatedMillis / unitWorkingDay)
            };

            if (cbRelease.plannedReleaseDate) {
                dhxTask.start_date = new Date(cbRelease.plannedReleaseDate);
                dhxTask._type = DhxGanttDef.TTaskType.Release;
                dhxTask.type = gantt.config.types.milestone;
            }

            var userNames = [];
            var userIdList = [];
            if (cbTask.assignedTo) {
                cbTask.assignedTo.forEach(function(user) {
                    userNames.push(getUserName(aAllMaps.userMap[user.uri]));
                    userIdList.push(user.uri);
                });
            }
            dhxTask.user = userNames.join(',');
            dhxTask._userIdList = userIdList;

            if (cbTask.endDate) {
                dhxTask.end_date = new Date(cbTask.endDate);
            }

            // This is required to display adjustment icon
            if (!dhxTask.duration || dhxTask.duration < 1) {
                dhxTask.duration = 1;
            }

            if (aParentUri) {
                dhxTask.parent = aParentUri;
            } else if (cbTask.parent) {
                dhxTask.parent = cbTask.parent.uri;
            }

            // color
            if (cbTask.status) {
                if (cbTask.status.style) {
                    dhxTask.color = cbTask.status.style;
                } else {
                    dhxTask.color = default_color[cbTask.status.name];
                }
            } else {
                dhxTask.color = 'white';
            }

            return dhxTask;
        }

        function convertCbTasksToDhxTasks(aAllMaps: TAllMaps, aCbTasks: Cb.TTask[], aParentUri?: string): DhxGantt.TTask[] {
            var dhxTasks = [];
            aCbTasks.forEach(function(cbTask) {
                dhxTasks.push(covertCbItemToDhxTask(aAllMaps, cbTask, aParentUri));
            });
            return dhxTasks;
        }

        interface TGroupTask extends DhxGantt.TTask {
            groupType?: TGroupType;
            child?: TGroupTask[];
        }

        var KUnknownIdentifier = 'UNKNOWN';
        var KIgnoreIdentifier = 'IGNORE';
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
            if (aTask._type == Cb.TItemType.Release) {
                return KIgnoreIdentifier;
            }
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
                type: gantt.config.types.project,
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
                type: gantt.config.types.project,
                _type: DhxGanttDef.TTaskType.Project
            };
        };
        KGroupConverters[TGroupType.BySprint] = function(aAllMaps: TAllMaps, aReleaseUri: string, aParentId?: string): DhxGantt.TTask {
            var release: Cb.TRelease = aAllMaps.itemMap[aReleaseUri];
            console.log(release);

            return covertCbItemToDhxTask(aAllMaps, release, aParentId);
//            var ret: DhxGantt.TTask = {
//                id: release.uri,
//                text: release.name,
//                user: '-',
//                _type: DhxGanttDef.TTaskType.Release
//            };
//            if (release.parent) {
//                var parentId = aParentId ? aParentId + '>' : '';
//                ret.parent = parentId + release.parent.uri;
//            }
//            return ret;
        };

        var KUnknownConverter = {};
        KUnknownConverter[TGroupType.ByUser] = function() {
            return {
                id: '__unknown_user__',
                text: 'User not assigned',
                user: '-',
                type: gantt.config.types.project,
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
                type: gantt.config.types.project,
                _type: DhxGanttDef.TTaskType.Release
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

                    if (key == KIgnoreIdentifier) {
                        return;
                    }

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

        function processLinks(aAllMaps: TAllMaps, aTasks: Cb.TTask[]): DhxGantt.TLink[] {
            var ret: DhxGantt.TLink[] = [];

            aTasks.forEach(function(task) {
                if (task._associations) {
                    task._associations.forEach(function(a) {
                        try {
                            if (a.type.name == 'depends') {
                                ret.push({
                                    id: a.uri,
                                    source: a.to.uri,
                                    target: a.from.uri,
                                    type: '0'
                                });
                            } else if (a.type.name == 'child') {
                                ret.push({
                                    id: a.uri,
                                    source: a.from.uri,
                                    target: a.to.uri,
                                    type: '1'
                                });
                            } else if (a.type.name == 'parent') {
                                ret.push({
                                    id: a.uri,
                                    source: a.from.uri,
                                    target: a.to.uri,
                                    type: '1'
                                });
                            } else if (a.type.name == 'derived') {
                                ret.push({
                                    id: a.uri,
                                    source: a.to.uri,
                                    target: a.from.uri,
                                    type: '0'
                                });
                            }
                        } catch (e) {
                            console.error(task);
                        }
                    });
                }

                if (task.release) {
                    task.release.forEach(function(r) {
                        ret.push({
                            id: task.uri + '-' + r.uri,
                            source: task.uri,
                            target: r.uri,
                            type: '0'
                        });
                    });
                }
            });

            return ret;
        }


        function generatePropertyFilter(aPropOrder: string[], aValues: any[], aInclude: boolean) {
            return function(obj) {
                var match = false, i, len = aPropOrder.length;

                for (i=0; i<len; i++) {
                    obj = obj[aPropOrder[i]];
                    if (typeof obj == 'undefined') {
                        break;
                    }
                }

                if (i == len) {
                    len = aValues.length;
                    for (i=0; i<len; i++) {
                        if (obj == aValues[i]) {
                            match = true;
                            break;
                        }
                    }
                }

                return aInclude ? match: !match;
            }
        }

        function generatePropertySorter(aProp: string, aAscending: boolean, aCompare, aAlternative?: string) {
            return function(objA, objB) {
                var varA = objA[aProp] || objA[aAlternative], varB = objB[aProp] || objB[aAlternative];
                if (aAscending) {
                    return aCompare ? aCompare(varA, varB) : varA - varB;
                } else {
                    return aCompare ? aCompare(varB, varA) : varB - varA;
                }
                return 0;
            }
        }

        function dateStringCompare(a, b) {
            return (new Date(a)).getTime() - (new Date(b)).getTime();
        }

        var KSorterByType = {};
        KSorterByType[TSortingType.ByStartTime] = generatePropertySorter('startDate', true, dateStringCompare, 'submittedAt');
        KSorterByType[TSortingType.ByStartTimeDsc] = generatePropertySorter('startDate', false, dateStringCompare, 'submittedAt');
        KSorterByType[TSortingType.ByEndTime] = generatePropertySorter('endDate', true, dateStringCompare);
        KSorterByType[TSortingType.ByEndTimeDsc] = generatePropertySorter('endDate', false, dateStringCompare);
        KSorterByType[TSortingType.BySubmittedTime] = generatePropertySorter('submittedAt', true, dateStringCompare);
        KSorterByType[TSortingType.BySubmittedTimeDsc] = generatePropertySorter('submittedAt', false, dateStringCompare);
        KSorterByType[TSortingType.ByModifiedTime] = generatePropertySorter('modifiedAt', true, dateStringCompare);
        KSorterByType[TSortingType.ByModifiedTimeDsc] = generatePropertySorter('modifiedAt', false, dateStringCompare);

        function generateSorter(aType: TSortingType) {
            return KSorterByType[aType];
        }

        export function getDhxDataByProject(
                aProjectUri: string,
                aGroupings: TGroupType[],
                aFilter: TFilterType,
                aSorting: TSortingType,
                aCb: (err, aDhxData: DhxGantt.TData, aDhxMarkerList: DhxGantt.TMarker[]) => void ) {

            var s = [];

            var cachedProjectInfo: TCachedProjectInfo;
            s.push(function(done) {
                cache.getCachedProjectInfo(aProjectUri, function(err, cached) {
                    console.log('getDhxDataByProject');

                    cachedProjectInfo = cached;

                    done(err);
                });
            });

            var tasks;
            var links;
            s.push(function(done) {

                var allMaps = cache.getAllMaps();

                var cbTasks: any[] = cachedProjectInfo.releases.slice(0);
//                var cbTasks = [];
                cbTasks = cbTasks.concat(cachedProjectInfo.tasks);
                cbTasks = cbTasks.concat(cachedProjectInfo.outerTasks);

                var filters = [];
                if (aFilter & TFilterType.ByWithoutCompletedTask) {
                    filters.push(generatePropertyFilter(['status', 'name'], ['Closed', 'Completed'], false));
                }
                filters.forEach(function(f) {
                    cbTasks = cbTasks.filter(f);
                });

                var sorter = generateSorter(aSorting);
                if (sorter) {
                    cbTasks = cbTasks.sort(sorter);
                }

                var groupTasks = processGrouping(allMaps, cbTasks, aGroupings, 0);

                tasks = getTasks(groupTasks);

                links = processLinks(allMaps, cbTasks);

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
                    links: links
                }, markers);
            });

        }
    }
}
