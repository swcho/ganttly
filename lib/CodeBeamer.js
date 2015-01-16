/// <reference path='../typings/tsd.d.ts'/>
/// <reference path="../directive/dhxGantt/dhxGantt.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var Cb;
(function (Cb) {
    (function (TUserStatus) {
        TUserStatus[TUserStatus["EInActivation"] = 0] = "EInActivation";
        TUserStatus[TUserStatus["EActivated"] = 1] = "EActivated";
        TUserStatus[TUserStatus["EDisabled"] = 2] = "EDisabled";
    })(Cb.TUserStatus || (Cb.TUserStatus = {}));
    var TUserStatus = Cb.TUserStatus;

    
    (function (TProjectDescFormat) {
        TProjectDescFormat[TProjectDescFormat["EPlain"] = 0] = "EPlain";
        TProjectDescFormat[TProjectDescFormat["EHtml"] = 1] = "EHtml";
        TProjectDescFormat[TProjectDescFormat["EWiki"] = 2] = "EWiki";
    })(Cb.TProjectDescFormat || (Cb.TProjectDescFormat = {}));
    var TProjectDescFormat = Cb.TProjectDescFormat;
    (function (TProjectCategory) {
        TProjectCategory[TProjectCategory["ECommunications"] = 0] = "ECommunications";
        TProjectCategory[TProjectCategory["ECollaborative"] = 1] = "ECollaborative";
        TProjectCategory[TProjectCategory["EDatabase"] = 2] = "EDatabase";
        TProjectCategory[TProjectCategory["EDesktop"] = 3] = "EDesktop";
        TProjectCategory[TProjectCategory["EEducation"] = 4] = "EEducation";
        TProjectCategory[TProjectCategory["EInternet"] = 5] = "EInternet";
        TProjectCategory[TProjectCategory["EMultimedia"] = 6] = "EMultimedia";
        TProjectCategory[TProjectCategory["EOffice"] = 7] = "EOffice";
        TProjectCategory[TProjectCategory["EPrinting"] = 8] = "EPrinting";
        TProjectCategory[TProjectCategory["EScrum"] = 9] = "EScrum";
        TProjectCategory[TProjectCategory["ESystemDevelopment"] = 10] = "ESystemDevelopment";
        TProjectCategory[TProjectCategory["EEditors"] = 11] = "EEditors";
        TProjectCategory[TProjectCategory["EOther"] = 12] = "EOther";
    })(Cb.TProjectCategory || (Cb.TProjectCategory = {}));
    var TProjectCategory = Cb.TProjectCategory;
    (function (TProjectPropagation) {
        TProjectPropagation[TProjectPropagation["EPrivate"] = 0] = "EPrivate";
        TProjectPropagation[TProjectPropagation["EPublicWithJoinApproval"] = 1] = "EPublicWithJoinApproval";
        TProjectPropagation[TProjectPropagation["EPublicWithoutApproval"] = 2] = "EPublicWithoutApproval";
    })(Cb.TProjectPropagation || (Cb.TProjectPropagation = {}));
    var TProjectPropagation = Cb.TProjectPropagation;
    (function (TProjectHiddenMenuItems) {
        TProjectHiddenMenuItems[TProjectHiddenMenuItems["EWiki"] = 0] = "EWiki";
        TProjectHiddenMenuItems[TProjectHiddenMenuItems["EDocuments"] = 1] = "EDocuments";
        TProjectHiddenMenuItems[TProjectHiddenMenuItems["ETrackers"] = 2] = "ETrackers";
        TProjectHiddenMenuItems[TProjectHiddenMenuItems["EConfigItems"] = 3] = "EConfigItems";
        TProjectHiddenMenuItems[TProjectHiddenMenuItems["EReports"] = 4] = "EReports";
        TProjectHiddenMenuItems[TProjectHiddenMenuItems["EForums"] = 5] = "EForums";
        TProjectHiddenMenuItems[TProjectHiddenMenuItems["EChats"] = 6] = "EChats";
        TProjectHiddenMenuItems[TProjectHiddenMenuItems["ESCMRepositories"] = 7] = "ESCMRepositories";
    })(Cb.TProjectHiddenMenuItems || (Cb.TProjectHiddenMenuItems = {}));
    var TProjectHiddenMenuItems = Cb.TProjectHiddenMenuItems;

    
    (function (TTrackerDescFormat) {
        TTrackerDescFormat[TTrackerDescFormat["EPlain"] = 0] = "EPlain";
        TTrackerDescFormat[TTrackerDescFormat["EHtml"] = 1] = "EHtml";
        TTrackerDescFormat[TTrackerDescFormat["EWiki"] = 2] = "EWiki";
    })(Cb.TTrackerDescFormat || (Cb.TTrackerDescFormat = {}));
    var TTrackerDescFormat = Cb.TTrackerDescFormat;

    

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

    function send(aMethod, aUrl, aParam, aCb) {
        var url = host + aUrl;
        console.info(aMethod + ': ' + url);
        var options = {};
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
            };
        }

        var promise = Http[aMethod.toLowerCase()](options);
        promise.then(function (resp) {
            aCb(null, resp.body);
        });
        promise.catch(function (err) {
            aCb(err);
        });
    }

    function getPageContainsString(aUri, aPageNo, aStr, aCb) {
        send('GET', aUri + '/page/' + aPageNo, {
            filter: aStr
        }, aCb);
    }

    var CRestApi = (function () {
        function CRestApi(aBase) {
            this._base = aBase;
        }
        CRestApi.prototype.getSchema = function (aCb) {
            send('GET', '/' + this._base + '/schema', null, aCb);
        };
        return CRestApi;
    })();
    Cb.CRestApi = CRestApi;

    var CUserApi = (function (_super) {
        __extends(CUserApi, _super);
        function CUserApi() {
            _super.call(this, 'user');
        }
        CUserApi.prototype.getPage = function (aPageNo, aStr, aCb) {
            getPageContainsString('/users', aPageNo, aStr, aCb);
        };
        return CUserApi;
    })(CRestApi);
    Cb.CUserApi = CUserApi;

    var CRoleApi = (function (_super) {
        __extends(CRoleApi, _super);
        function CRoleApi() {
            _super.call(this, 'role');
        }
        return CRoleApi;
    })(CRestApi);
    Cb.CRoleApi = CRoleApi;

    var CProjectApi = (function (_super) {
        __extends(CProjectApi, _super);
        function CProjectApi() {
            _super.call(this, 'project');
        }
        CProjectApi.prototype.getPage = function (aPageNo, aStr, aCb) {
            if (aStr.length) {
                aStr = aStr + '*';
            }
            getPageContainsString('/projects', aPageNo, aStr, aCb);
        };
        return CProjectApi;
    })(CRestApi);
    Cb.CProjectApi = CProjectApi;

    var CTrackerTypeApi = (function (_super) {
        __extends(CTrackerTypeApi, _super);
        function CTrackerTypeApi() {
            _super.call(this, 'tracker/type');
        }
        return CTrackerTypeApi;
    })(CRestApi);
    Cb.CTrackerTypeApi = CTrackerTypeApi;

    var CTrackerApi = (function (_super) {
        __extends(CTrackerApi, _super);
        function CTrackerApi() {
            _super.call(this, 'tracker');
        }
        /**
        * Get a list of all trackers in a project
        * @param aProjectUri
        * @param aTypes
        */
        CTrackerApi.prototype.getTrackers = function (aProjectUri, aTypes, aCb) {
            var typeList = aTypes.join(',');
            var param = null;
            if (typeList.length) {
                param = { type: typeList };
            }
            send('GET', aProjectUri + '/trackers', param, aCb);
        };

        CTrackerApi.prototype.getTaskTrackers = function (aProjectUri, aCb) {
            this.getTrackers(aProjectUri, ['Task'], aCb);
        };

        CTrackerApi.prototype.getItems = function (aTrackerUri, aCb) {
            send('GET', aTrackerUri + '/items', null, aCb);
        };

        /**
        * Get a page of tracker items
        */
        CTrackerApi.prototype.getItemsPage = function (aTrackerUri, aPage, aCb) {
            send('GET', aTrackerUri + '/items/page/' + aPage, null, aCb);
        };
        return CTrackerApi;
    })(CRestApi);
    Cb.CTrackerApi = CTrackerApi;

    var CTrackerItemApi = (function (_super) {
        __extends(CTrackerItemApi, _super);
        function CTrackerItemApi() {
            _super.call(this, null);
        }
        return CTrackerItemApi;
    })(CRestApi);
    Cb.CTrackerItemApi = CTrackerItemApi;

    Cb.user = new CUserApi();
    Cb.role = new CRoleApi();
    Cb.project = new CProjectApi();
    Cb.trackerType = new CTrackerTypeApi();
    Cb.tracker = new CTrackerApi();
})(Cb || (Cb = {}));

var CbUtils;
(function (CbUtils) {
    function capitaliseFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function schemaToTypeScript(typeName, schema) {
        var buf = 'export interface T' + typeName + ' {\n';
        var bufEnum = '';
        Object.keys(schema.properties).forEach(function (key) {
            var attr = schema.properties[key];
            var name = key;
            if (schema.required.indexOf(key) == -1) {
                name = name + '?';
            }

            if (attr.enum) {
                var enumName = 'T' + typeName + capitaliseFirstLetter(key);
                bufEnum += 'export enum ' + enumName + '{\n';
                attr.enum.forEach(function (str) {
                    var enumValue = 'E';
                    str.split(' ').forEach(function (s) {
                        enumValue += capitaliseFirstLetter(s);
                    });
                    bufEnum += enumValue + ',\n';
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
    function getTasksByTrackers(aTrackers, aCb) {
        aTrackers = aTrackers || [];
        var p = [];
        var tasks = [];
        aTrackers.forEach(function (tracker) {
            if (tracker.type.name == 'Task') {
                p.push(function (done) {
                    Cb.tracker.getItems(tracker.uri, function (err, items) {
                        tasks = tasks.concat(items);
                        done(err);
                    });
                });
            }
        });

        async.parallel(p, function (err) {
            aCb(err, tasks);
        });
    }
    CbUtils.getTasksByTrackers = getTasksByTrackers;

    function getTasksByProject(aProjectUri, aCb) {
        var s = [];
        var task_trackers;
        var result_tasks;
        s.push(function (done) {
            Cb.tracker.getTaskTrackers(aProjectUri, function (err, trackers) {
                task_trackers = trackers;
                done(err);
            });
        });
        s.push(function (done) {
            getTasksByTrackers(task_trackers, function (err, tasks) {
                result_tasks = tasks;
                done(err);
            });
        });
        async.series(s, function (err) {
            aCb(err, result_tasks);
        });
    }
    CbUtils.getTasksByProject = getTasksByProject;

    var unitDay = 1000 * 60 * 60 * 24;
    var unitHour = 1000 * 60 * 60;
    var unitWorkingDay = gConfig.workingHours ? gConfig.workingHours * unitHour : unitDay;
    var holidayAwareness = gConfig.holidayAwareness;

    function covertCbTaskToDhxTask(aCbTask, parentUri) {
        var dhxTask = {
            id: aCbTask.uri,
            text: aCbTask.name,
            start_date: new Date(aCbTask.startDate || aCbTask.modifiedAt),
            progress: aCbTask.spentEstimatedHours || 0,
            priority: aCbTask.priority ? aCbTask.priority.name : 'Noraml',
            status: aCbTask.status ? aCbTask.status.name : 'None',
            estimatedMillis: aCbTask.estimatedMillis,
            estimatedDays: Math.ceil(aCbTask.estimatedMillis / unitWorkingDay)
        };

        var userNames = [];
        var userIdList = [];
        if (aCbTask.assignedTo) {
            aCbTask.assignedTo.forEach(function (user) {
                userNames.push(user.name);
                userIdList.push(user.uri);
            });
        }
        dhxTask.user = userNames.join(',');
        dhxTask.userIdList = userIdList;

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
    CbUtils.covertCbTaskToDhxTask = covertCbTaskToDhxTask;

    function convertCbTasksToDhxData(aCbTasks) {
        var dhxTasks = [];
        aCbTasks.forEach(function (cbTask) {
            dhxTasks.push(covertCbTaskToDhxTask(cbTask));
        });
        return {
            data: dhxTasks,
            links: []
        };
    }
    CbUtils.convertCbTasksToDhxData = convertCbTasksToDhxData;
})(CbUtils || (CbUtils = {}));
//# sourceMappingURL=CodeBeamer.js.map
