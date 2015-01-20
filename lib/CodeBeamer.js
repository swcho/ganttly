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

        CCmdbApi.prototype.getItemsByCmdb = function (aCmdbUri, aCb) {
            send('GET', aCmdbUri + '/items', null, aCb);
        };

        CCmdbApi.prototype.getItem = function (aReleaseUri, aCb) {
            send('GET', aReleaseUri, null, aCb);
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

    var CItemApi = (function (_super) {
        __extends(CItemApi, _super);
        function CItemApi() {
            _super.call(this, null);
        }
        CItemApi.prototype.getItem = function (aReleaseUri, aCb) {
            send('GET', aReleaseUri, null, aCb);
        };
        return CItemApi;
    })(CRestApi);
    Cb.CItemApi = CItemApi;

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
    Cb.item = new CItemApi();
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

    

    function getItems(aItemUriList, aCb) {
        console.log('getItems');

        var p = [];
        var items = [];
        var itemMap = {};
        aItemUriList.forEach(function (uri) {
            p.push(function (done) {
                Cb.item.getItem(uri, function (err, i) {
                    items.push(i);
                    itemMap[uri] = i;
                    done(err);
                });
            });
        });

        async.parallel(p, function (err) {
            aCb(err, items, itemMap);
        });
    }

    function getReleases(aReleaseUriList, aCb) {
        console.log('getReleases');

        var p = [];
        var releases = [];
        var releaseMap = {};
        aReleaseUriList.forEach(function (uri) {
            p.push(function (done) {
                Cb.cmdb.getItem(uri, function (err, r) {
                    releases.push(r);
                    releaseMap[uri] = r;
                    done(err);
                });
            });
        });

        async.parallel(p, function (err) {
            aCb(err, releases, releaseMap);
        });
    }

    function getReleasesByCmdbList(aCmdbList, aCb) {
        console.log('getReleasesByCmdbList');

        aCmdbList = aCmdbList || [];
        var p = [];
        var releases = [];
        aCmdbList.forEach(function (cmdb) {
            if (cmdb.type.name == 'Release') {
                p.push(function (done) {
                    Cb.cmdb.getItemsByCmdb(cmdb.uri, function (err, items) {
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
        console.log('getTasksByTrackers');

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
        var releases = [];
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
            getReleasesByCmdbList(cmdbList, function (err, rlist) {
                rlist.forEach(function (r) {
                    releaseMap[r.uri] = r;
                });
                releases = rlist;
                done(err);
            });
        });
        async.series(s, function (err) {
            aCb(err, cmdbMap, releases, releaseMap);
        });
    }

    function getTaskInfoByProject(aProjectUri, aCb) {
        console.log('getTaskInfoByProject');

        var s = [];
        var trackers;
        var trackerMap = {};
        var taskMap = {};
        var tasks = [];
        s.push(function (done) {
            Cb.tracker.getTaskTrackers(aProjectUri, function (err, tlist) {
                trackers = tlist;
                tlist.forEach(function (t) {
                    t.project = t.project || { uri: aProjectUri };
                    trackerMap[t.uri] = t;
                });
                done(err);
            });
        });
        s.push(function (done) {
            getTasksByTrackers(trackers, function (err, ts) {
                ts.forEach(function (t) {
                    taskMap[t.uri] = t;
                    tasks.push(t);
                });
                done(err);
            });
        });
        async.series(s, function (err) {
            aCb(err, trackers, trackerMap, tasks, taskMap);
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

        var associations = [];

        aTasks.forEach(function (t) {
            p.push(function (done) {
                Cb.association.getAllAssociationByTypes(t.uri, ['depends', 'child', 'parent'], function (err, a) {
                    if (a && a.length) {
                        t._associations = a;
                        associations = associations.concat(a);
                    }
                    done(err);
                });
            });
        });

        async.parallel(p, function (err) {
            aCb(err, associations);
        });
    }

    var KReleaseProps = ['release', '업무구분'];
    function getReleaseUriListFromTask(aTask) {
        var i, len = KReleaseProps.length, p, uriList = [];
        for (i = 0; i < len; i++) {
            p = KReleaseProps[i];
            if (aTask[p] && aTask[p].length) {
                aTask[p].forEach(function (v) {
                    uriList.push(v.uri);
                });
                return uriList;
            }
        }
        return null;
    }

    var CCbCache = (function () {
        function CCbCache() {
            this._cache = {};
            this._projectMap = {};
            this._trackerMap = {};
            this._releaseMap = {};
            this._userMap = {};
            this._itemMap = {};
        }
        CCbCache.prototype.getAllMaps = function () {
            return {
                projectMap: this._projectMap,
                userMap: this._userMap,
                releaseMap: this._releaseMap,
                trackerMap: this._trackerMap
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
            var trackers;
            var taskMap = {};
            var tasks = [];

            //            s.push(function(done) {
            //                getReleasesByProject(aProjectUri, function (err, cmap, rlist, rmap) {
            //                    cmdbMap = cmap;
            //                    releases = rlist;
            //                    releaseMap = rmap;
            //                    done();
            //                });
            //            });
            var releaseUriList;
            var userUriList;
            s.push(function (done) {
                getTaskInfoByProject(aProjectUri, function (err, trkList, trkM, tlist, tmap) {
                    trackers = trkList;
                    taskMap = tmap;
                    tasks = tlist;

                    var mapRelease = {};
                    var mapUser = {};
                    tasks.forEach(function (t) {
                        if (t.assignedTo) {
                            t.assignedTo.forEach(function (u) {
                                mapUser[u.uri] = null;
                            });
                        }

                        var uriList = getReleaseUriListFromTask(t);
                        if (uriList) {
                            uriList.forEach(function (uri) {
                                mapRelease[uri] = null;
                            });
                        }
                    });

                    releaseUriList = Object.keys(mapRelease);
                    userUriList = Object.keys(mapUser);

                    done(err);
                });
            });

            //            s.push(function(done) {
            //                getReleases(external_releases, function(err, rlist, rmap) {
            //                    releases = releases.concat(rlist);
            //                    done(err);
            //                });
            //            });
            var externalItemUriList;
            s.push(function (done) {
                populateAssociation(tasks, function (err, alist) {
                    var map = {};
                    alist.forEach(function (a) {
                        if (a.from && a.from.uri.indexOf('/item') == 0) {
                            map[a.from.uri] = null;
                        }

                        if (a.to && a.to.uri.indexOf('/item') == 0) {
                            map[a.to.uri] = null;
                        }
                    });
                    externalItemUriList = Object.keys(map);

                    done(err);
                });
            });

            var externalItemMap = this._itemMap;
            var externalItems;
            var externalReleaseUriList;
            var externalTrackerUriList;
            var externalProjectUriList;
            var externalUserUriList;
            s.push(function (done) {
                getItems(externalItemUriList, function (err, ilist, imap) {
                    var mapRelease = {};
                    var mapTracker = {};
                    var mapProject = {};
                    var mapUser = {};
                    ilist.forEach(function (item) {
                        var releaseUriList = getReleaseUriListFromTask(item);
                        if (releaseUriList) {
                            releaseUriList.forEach(function (ruri) {
                                mapRelease[ruri] = null;
                            });
                        }

                        mapTracker[item['tracker'].uri] = null;
                        mapProject[item['tracker'].project.uri] = null;
                        externalItemMap[item.uri] = item;
                        if (item['assignedTo']) {
                            item['assignedTo'].forEach(function (u) {
                                mapUser[u.uri] = null;
                            });
                        }
                    });
                    externalItems = ilist;
                    externalReleaseUriList = Object.keys(mapRelease);
                    externalTrackerUriList = Object.keys(mapTracker);
                    externalProjectUriList = Object.keys(mapProject);
                    externalUserUriList = Object.keys(mapUser);
                    done();
                });
            });

            var releaseMap = this._releaseMap;
            s.push(function (done) {
                var uriList = releaseUriList.concat(externalReleaseUriList);
                getItems(uriList, function (err, ilist, imap) {
                    ilist.forEach(function (release) {
                        releaseMap[release.uri] = release;
                    });
                    done();
                });
            });

            var trackerMap = this._trackerMap;
            s.push(function (done) {
                getItems(externalTrackerUriList, function (err, ilist, imap) {
                    ilist = trackers.concat(ilist);
                    ilist.forEach(function (tracker) {
                        trackerMap[tracker.uri] = tracker;
                    });
                    done(err);
                });
            });

            var userMap = this._userMap;
            s.push(function (done) {
                var uriList = userUriList.concat(externalUserUriList);
                getItems(uriList, function (err, ilist, imap) {
                    ilist.forEach(function (i) {
                        userMap[i.uri] = i;
                    });
                    done();
                });
            });

            var projectMap = this._projectMap;
            s.push(function (done) {
                var uriList = [aProjectUri].concat(externalProjectUriList);
                getItems(uriList, function (err, ilist, imap) {
                    ilist.forEach(function (i) {
                        projectMap[i.uri] = i;
                    });
                    done();
                });
            });

            async.series(s, function (err) {
                var externalTasks = [];
                externalItems.forEach(function (item) {
                    var tracker = trackerMap[item.tracker.uri];
                    if (tracker.type.name == 'Task') {
                        externalTasks.push(item);
                    }
                });

                var ret = {
                    cmdbMap: cmdbMap,
                    taskMap: taskMap,
                    tasks: tasks,
                    externalTasks: externalTasks
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

        function convertCbTasksToDhxTasks(aAllMaps, aCbTasks, aParentUri) {
            var dhxTasks = [];
            aCbTasks.forEach(function (cbTask) {
                dhxTasks.push(covertCbTaskToDhxTask(aAllMaps, cbTask, aParentUri));
            });
            return dhxTasks;
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
        KGroupKeyIdentifiers[1 /* ByUser */] = function (aAllMaps, aTask) {
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
        KGroupKeyIdentifiers[2 /* ByProject */] = function (aAllMaps, aTask) {
            return aAllMaps.trackerMap[aTask.tracker.uri].project.uri;
        };
        KGroupKeyIdentifiers[3 /* BySprint */] = function (aAllMaps, aTask) {
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
        KGroupConverters[1 /* ByUser */] = function (aAllMaps, aUserUri) {
            var user = aAllMaps.userMap[aUserUri];
            return {
                id: user.uri,
                text: getUserName(user),
                user: '-',
                _type: 1 /* User */
            };
        };
        KGroupConverters[2 /* ByProject */] = function (aAllMaps, aProjectUri) {
            var project = aAllMaps.projectMap[aProjectUri];
            console.log(project);
            return {
                id: project.uri,
                text: project.name,
                user: '-',
                _type: 2 /* Project */
            };
        };
        KGroupConverters[3 /* BySprint */] = function (aAllMaps, aReleaseUri, aParentId) {
            var release = aAllMaps.releaseMap[aReleaseUri];
            console.log(release);
            var ret = {
                id: release.uri,
                text: release.name,
                user: '-',
                _type: 3 /* Sprint */
            };
            if (release.parent) {
                var parentId = aParentId ? aParentId + '>' : '';
                ret.parent = parentId + release.parent.uri;
            }
            return ret;
        };

        var KUnknownConverter = {};
        KUnknownConverter[1 /* ByUser */] = function () {
            return {
                id: '__unknown_user__',
                text: 'User not assigned',
                user: '-',
                _type: 1 /* User */
            };
        };
        KUnknownConverter[2 /* ByProject */] = function () {
            return null;
        };
        KUnknownConverter[3 /* BySprint */] = function () {
            return {
                id: '__unknown_release__',
                text: 'Relase not assigned',
                user: '-',
                _type: 3 /* Sprint */
            };
        };

        function processGrouping(aAllMaps, aTasks, aGroupings, aDepth, aParentId) {
            var type = aGroupings[aDepth];
            var ret = [];
            if (type) {
                console.log('processGrouping: ' + aDepth + ':' + type);

                var groupKeyIdentifier = KGroupKeyIdentifiers[type];
                var map = {};
                aTasks.forEach(function (t) {
                    var key = groupKeyIdentifier(aAllMaps, t);
                    if (map[key]) {
                        map[key].push(t);
                    } else {
                        map[key] = [t];
                    }
                });

                var groupConverter = KGroupConverters[type];
                var unknownTask = KUnknownConverter[type]();
                Object.keys(map).forEach(function (key) {
                    var task;
                    if (key == KUnknownIdentifier) {
                        task = unknownTask;
                    } else {
                        task = groupConverter(aAllMaps, key, aParentId);
                    }
                    if (aParentId) {
                        task.parent = aParentId;
                        task.id = aParentId + '>' + task.id;
                    }
                    task.child = processGrouping(aAllMaps, map[key], aGroupings, aDepth + 1, task.id);
                    ret.push(task);
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

        function processLinks(aAllMaps, aTasks) {
            var ret = [];

            aTasks.forEach(function (task) {
                if (task._associations) {
                    task._associations.forEach(function (a) {
                        if (a.type.name == 'depends') {
                            //                            try {
                            //                                ret.push({
                            //                                    id: a.uri,
                            //                                    source: a.to.uri,
                            //                                    target: a.from.uri,
                            //                                    type: '0'
                            //                                });
                            //                            } catch(e) {
                            //                                console.error(task);
                            //                            }
                        } else if (a.type.name == 'child') {
                            try  {
                                ret.push({
                                    id: a.uri,
                                    source: a.to.uri,
                                    target: a.from.uri,
                                    type: '1'
                                });
                            } catch (e) {
                                console.error(task);
                            }
                        }
                    });
                }
            });

            return ret;
        }

        function getDhxDataByProject(aProjectUri, aGroupings, aCb) {
            var s = [];

            var cachedProjectInfo;
            s.push(function (done) {
                CbUtils.cache.getCachedProjectInfo(aProjectUri, function (err, cached) {
                    console.log('getDhxDataByProject');

                    cachedProjectInfo = cached;

                    done(err);
                });
            });

            var tasks;
            var links;
            s.push(function (done) {
                var allMaps = CbUtils.cache.getAllMaps();

                var cbTasks = cachedProjectInfo.tasks.concat(cachedProjectInfo.externalTasks);

                var groupTasks = processGrouping(allMaps, cbTasks, aGroupings, 0);

                tasks = getTasks(groupTasks);

                links = processLinks(allMaps, cbTasks);

                done();
            });

            async.series(s, function (err) {
                var date_to_str = gantt.date.date_to_str(gantt.config.task_date);

                var markers = [{
                        start_date: new Date(),
                        css: 'today',
                        title: date_to_str(new Date()),
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
        UiUtils.getDhxDataByProject = getDhxDataByProject;
    })(CbUtils.UiUtils || (CbUtils.UiUtils = {}));
    var UiUtils = CbUtils.UiUtils;
})(CbUtils || (CbUtils = {}));
//# sourceMappingURL=CodeBeamer.js.map
