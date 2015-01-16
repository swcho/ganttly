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

        CUserApi.prototype.getByUri = function (aUserUri, aCb) {
            send('GET', aUserUri, null, aCb);
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
        CProjectApi.prototype.getProject = function (aProjectUri, aCb) {
            send('GET', aProjectUri, null, aCb);
        };

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

    var CCmdbApi = (function (_super) {
        __extends(CCmdbApi, _super);
        function CCmdbApi() {
            _super.call(this, null);
        }
        CCmdbApi.prototype.getReleaseCmdbList = function (aProjectUri, aCb) {
            send('GET', aProjectUri + '/categories', {
                type: 'Release'
            }, aCb);
        };

        CCmdbApi.prototype.getItems = function (aCmdbUri, aCb) {
            send('GET', aCmdbUri + '/items', null, aCb);
        };
        return CCmdbApi;
    })(CRestApi);
    Cb.CCmdbApi = CCmdbApi;

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

    var CAssociationApi = (function (_super) {
        __extends(CAssociationApi, _super);
        function CAssociationApi() {
            _super.call(this, null);
        }
        CAssociationApi.prototype.getAllAssociation = function (aItemUri, aCb) {
            send('GET', aItemUri + '/associations', {
                inout: true
            }, aCb);
        };

        CAssociationApi.prototype.getAllAssociationByTypes = function (aItemUri, aTypes, aCb) {
            send('GET', aItemUri + '/associations', {
                type: aTypes.join(','),
                inout: true
            }, aCb);
        };
        return CAssociationApi;
    })(CRestApi);
    Cb.CAssociationApi = CAssociationApi;

    Cb.user = new CUserApi();
    Cb.role = new CRoleApi();
    Cb.project = new CProjectApi();
    Cb.trackerType = new CTrackerTypeApi();
    Cb.cmdb = new CCmdbApi();
    Cb.tracker = new CTrackerApi();
    Cb.association = new CAssociationApi();
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

    

    function getReleaseByCmdbList(aCmdbList, aCb) {
        aCmdbList = aCmdbList || [];
        var p = [];
        var releases = [];
        aCmdbList.forEach(function (cmdb) {
            if (cmdb.type.name == 'Release') {
                p.push(function (done) {
                    Cb.cmdb.getItems(cmdb.uri, function (err, items) {
                        releases = releases.concat(items);
                        done(err);
                    });
                });
            }
        });

        async.parallel(p, function (err) {
            aCb(err, releases);
        });
    }

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

    function getReleasesByProject(aProjectUri, aCb) {
        console.log('getReleasesByProject');

        var s = [];
        var cmdbList;
        var cmdbMap = {};
        var releaseMap = {};
        s.push(function (done) {
            Cb.cmdb.getReleaseCmdbList(aProjectUri, function (err, list) {
                cmdbList = list;
                cmdbList.forEach(function (c) {
                    c.project = c.project || { uri: aProjectUri };
                    cmdbMap[c.uri] = c;
                });
                done(err);
            });
        });
        s.push(function (done) {
            getReleaseByCmdbList(cmdbList, function (err, ts) {
                ts.forEach(function (t) {
                    releaseMap[t.uri] = t;
                });
                done(err);
            });
        });
        async.series(s, function (err) {
            aCb(err, cmdbMap, releaseMap);
        });
    }

    function getTaskInfoByProject(aProjectUri, aCb) {
        console.log('getTaskMapAndListByProject');

        var s = [];
        var task_trackers;
        var trackerMap = {};
        var taskMap = {};
        var tasks = [];
        s.push(function (done) {
            Cb.tracker.getTaskTrackers(aProjectUri, function (err, trackers) {
                task_trackers = trackers;
                trackers.forEach(function (t) {
                    t.project = t.project || { uri: aProjectUri };
                    trackerMap[t.uri] = t;
                });
                done(err);
            });
        });
        s.push(function (done) {
            getTasksByTrackers(task_trackers, function (err, ts) {
                ts.forEach(function (t) {
                    taskMap[t.uri] = t;
                    tasks.push(t);
                });
                done(err);
            });
        });
        async.series(s, function (err) {
            aCb(err, trackerMap, taskMap, tasks);
        });
    }

    function getUsersMapFromTasks(aTasks, aCb) {
        console.log('getUsersMapFromTasks');

        var userMap = {};

        aTasks.forEach(function (task) {
            if (task.assignedTo) {
                task.assignedTo.forEach(function (u) {
                    userMap[u.uri] = null;
                });
            }
        });

        var p = [];
        Object.keys(userMap).forEach(function (key) {
            p.push(function (done) {
                Cb.user.getByUri(key, function (err, user) {
                    userMap[key] = user;
                    done(err);
                });
            });
        });

        async.parallel(p, function (err) {
            aCb(err, userMap);
        });
    }

    function populateAssociation(aTasks, aCb) {
        console.log('populateAssociation');

        var p = [];

        aTasks.forEach(function (t) {
            p.push(function (done) {
                Cb.association.getAllAssociationByTypes(t.uri, ['depends', 'child', 'parent'], function (err, a) {
                    if (a && a.length) {
                        t._associations = a;
                    }
                    done(err);
                });
            });
        });

        async.parallel(p, function (err) {
            aCb(err);
        });
    }

    var CCbCache = (function () {
        function CCbCache() {
            this._cache = {};
            this._projectMap = {};
            this._userMap = {};
        }
        CCbCache.prototype.getAllMaps = function () {
            var _this = this;
            var releaseMap = {};
            var trackerMap = {};
            Object.keys(this._cache).forEach(function (projectUri) {
                var info = _this._cache[projectUri];
                if (info) {
                    Object.keys(info.releaseMap).forEach(function (releaseUri) {
                        releaseMap[releaseUri] = info.releaseMap[releaseUri];
                    });
                    Object.keys(info.trackerMap).forEach(function (trackerUri) {
                        trackerMap[trackerUri] = info.trackerMap[trackerUri];
                    });
                }
            });

            return {
                projectMap: this._projectMap,
                userMap: this._userMap,
                releaseMap: releaseMap,
                trackerMap: trackerMap
            };
        };

        CCbCache.prototype.getCachedProjectInfo = function (aProjectUri, aCb) {
            var _this = this;
            console.log('getCachedProjectInfo');

            if (this._cache[aProjectUri]) {
                aCb(null, this._cache[aProjectUri]);
                return;
            }

            var s = [];

            var cmdbMap;
            var trackerMap;
            var releaseMap;
            var taskMap = {};
            var tasks = [];

            s.push(function (done) {
                Cb.project.getProject(aProjectUri, function (err, project) {
                    _this._projectMap[aProjectUri] = project;
                    done(err);
                });
            });

            s.push(function (done) {
                getReleasesByProject(aProjectUri, function (err, cm, rm) {
                    cmdbMap = cm;
                    releaseMap = rm;
                    done();
                });
            });

            s.push(function (done) {
                getTaskInfoByProject(aProjectUri, function (err, trkM, tm, ts) {
                    trackerMap = trkM;
                    taskMap = tm;
                    tasks = ts;
                    done(err);
                });
            });

            s.push(function (done) {
                populateAssociation(tasks, function (err) {
                    done(err);
                });
            });

            s.push(function (done) {
                getUsersMapFromTasks(tasks, function (err, resp) {
                    Object.keys(resp).forEach(function (userUri) {
                        _this._userMap[userUri] = resp[userUri];
                    });
                    done(err);
                });
            });

            async.series(s, function (err) {
                var ret = {
                    cmdbMap: cmdbMap,
                    trackerMap: trackerMap,
                    releaseMap: releaseMap,
                    taskMap: taskMap,
                    tasks: tasks
                };

                _this._cache[aProjectUri] = ret;

                aCb(err, ret);
            });
        };
        return CCbCache;
    })();
    CbUtils.CCbCache = CCbCache;

    CbUtils.cache = new CCbCache();

    (function (TGroupType) {
        TGroupType[TGroupType["None"] = 0] = "None";
        TGroupType[TGroupType["ByUser"] = 1] = "ByUser";
        TGroupType[TGroupType["ByProject"] = 2] = "ByProject";
        TGroupType[TGroupType["BySprint"] = 3] = "BySprint";
    })(CbUtils.TGroupType || (CbUtils.TGroupType = {}));
    var TGroupType = CbUtils.TGroupType;

    (function (UiUtils) {
        var unitDay = 1000 * 60 * 60 * 24;
        var unitHour = 1000 * 60 * 60;
        var unitWorkingDay = gConfig.workingHours ? gConfig.workingHours * unitHour : unitDay;
        var holidayAwareness = gConfig.holidayAwareness;
        var reName = /^(.*)\(/;

        function getUserName(aUser) {
            var match = reName.exec(aUser.firstName);
            return match ? match[1] : aUser.name;
        }

        function covertCbTaskToDhxTask(aAllMaps, aCbTask, aParentUri) {
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

            return dhxTask;
        }

        function convertCbTasksToDhxTasks(aAllMaps, aCbTasks, aParentUri) {
            var dhxTasks = [];
            aCbTasks.forEach(function (cbTask) {
                dhxTasks.push(covertCbTaskToDhxTask(aAllMaps, cbTask, aParentUri));
            });
            return dhxTasks;
        }

        var KUnknownIdentifier = 'UNKNOWN';
        var KGroupKeyIndentifiers = {};
        KGroupKeyIndentifiers[1 /* ByUser */] = function (aAllMaps, aTask) {
            var ret = KUnknownIdentifier;
            if (aTask.assignedTo) {
                ret = aTask.assignedTo[0].uri;
            }
            return ret;
        };
        KGroupKeyIndentifiers[2 /* ByProject */] = function (aAllMaps, aTask) {
            return aAllMaps.trackerMap[aTask.tracker.uri].project.uri;
        };
        KGroupKeyIndentifiers[3 /* BySprint */] = function (aAllMaps, aTask) {
            var ret = KUnknownIdentifier;
            if (aTask.release) {
                ret = aTask.release[0].uri;
            }
            return ret;
        };

        var KGroupConverter = {};
        KGroupConverter[1 /* ByUser */] = function (aAllMaps, aUserUri) {
            var user = aAllMaps.userMap[aUserUri];
            return {
                id: user.uri,
                text: getUserName(user),
                _type: 1 /* User */
            };
        };
        KGroupConverter[2 /* ByProject */] = function (aAllMaps, aProjectUri) {
            var project = aAllMaps.projectMap[aProjectUri];
            return {
                id: project.uri,
                text: project.name,
                _type: 2 /* Project */
            };
        };
        KGroupConverter[3 /* BySprint */] = function (aAllMaps, aReleaseUri) {
            var release = aAllMaps.releaseMap[aReleaseUri];
            return {
                id: release.uri,
                text: release.name,
                _type: 3 /* Sprint */
            };
        };

        var KUnknownConverter = {};
        KUnknownConverter[1 /* ByUser */] = function () {
            return {
                id: '__unknown_user__',
                text: 'Not assigned',
                _type: 1 /* User */
            };
        };
        KUnknownConverter[2 /* ByProject */] = function () {
            return null;
        };
        KUnknownConverter[3 /* BySprint */] = function () {
            return {
                id: '__unknown_user__',
                text: 'Not assigned',
                _type: 3 /* Sprint */
            };
        };

        function processGrouping(aAllMaps, aTasks, aGroupings, aParentId) {
            var type = aGroupings.shift();
            var ret = [];
            if (type) {
                ret = [];
                var groupKeyIdentifier = KGroupKeyIndentifiers[type];
                var map = {};
                aTasks.forEach(function (t) {
                    var key = groupKeyIdentifier(aAllMaps, t);
                    if (map[key]) {
                        map[key].push(t);
                    } else {
                        map[key] = [t];
                    }
                });

                var groupConverter = KGroupConverter[type];
                var unknownTask = KUnknownConverter[type]();
                Object.keys(map).forEach(function (key) {
                    if (key == KUnknownIdentifier) {
                        unknownTask.child = convertCbTasksToDhxTasks(aAllMaps, map[key], unknownTask.id);
                        ret.push(unknownTask);
                    } else {
                        var task = groupConverter(aAllMaps, key);
                        task.child = processGrouping(aAllMaps, map[key], aGroupings, task.id);
                        ret.push(task);
                    }
                });
            } else {
                ret = convertCbTasksToDhxTasks(aAllMaps, aTasks, aParentId);
            }
            return ret;
        }

        function getTasks(groupTasks) {
            var tasks = [];
            groupTasks.forEach(function (t) {
                tasks.push(t);
                if (t.child) {
                    tasks = tasks.concat(getTasks(t.child));
                }
            });
            return tasks;
        }

        function getDhxDataByProject(aProjectUri, aGroupings, aCb) {
            CbUtils.cache.getCachedProjectInfo(aProjectUri, function (err, cached) {
                console.log('getDhxDataByProject');

                var allMaps = CbUtils.cache.getAllMaps();

                var groupTasks = processGrouping(allMaps, cached.tasks, aGroupings);

                var tasks = getTasks(groupTasks);

                aCb(err, {
                    data: tasks,
                    links: []
                });
            });
        }
        UiUtils.getDhxDataByProject = getDhxDataByProject;
    })(CbUtils.UiUtils || (CbUtils.UiUtils = {}));
    var UiUtils = CbUtils.UiUtils;
})(CbUtils || (CbUtils = {}));
//# sourceMappingURL=CodeBeamer.js.map
