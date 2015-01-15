

/// <reference path='../typings/tsd.d.ts'/>

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
        console.log(aMethod + ': ' + url);
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

//        getPageContainsString(aPageNo, aStr, aCb) {
//            this.getPage(aPageNo, { filter: aStr }, aCb);
//        }
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

        /**
         * Get a page of tracker items
         */
        getItemsPage(aTrackerUri: string, aPage: number, aCb: (err, itemsPage: TItemsPage) => void) {
            send('GET', aTrackerUri + '/items/page/' + aPage, null, aCb);
        }
    }

    export class CTrackerItemApi extends CRestApi {
        constructor() {
            super('tracker/type/1');
        }
    }

    export var user = new CUserApi();
    export var role = new CRoleApi();
    export var project = new CProjectApi();
    export var trackerType = new CTrackerTypeApi();
    export var tracker = new CTrackerApi();
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

}
