/// <reference path='../typings/tsd.d.ts'/>
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

    

    (function (TItemType) {
        TItemType[TItemType["Unknown"] = 0] = "Unknown";
        TItemType[TItemType["Task"] = 1] = "Task";
        TItemType[TItemType["Release"] = 2] = "Release";
    })(Cb.TItemType || (Cb.TItemType = {}));
    var TItemType = Cb.TItemType;

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
        CItemApi.prototype.getItem = function (aItemUri, aCb) {
            send('GET', aItemUri, null, aCb);
        };

        CItemApi.prototype.getReferences = function (aItemUri, aCb) {
            send('GET', aItemUri + '/references', null, aCb);
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

        aItemUriList.forEach(function (uri) {
            p.push(function (done) {
                Cb.item.getItem(uri, function (err, i) {
                    items.push(i);
                    done(err);
                });
            });
        });

        async.parallel(p, function (err) {
            aCb(err, items);
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

    function getReleasesInfoByProject(aProjectUri, aCb) {
        console.log('getReleasesInfoByProject');

        var s = [];
        var cmdbList;
        var releases = [];
        var associations;

        s.push(function (done) {
            Cb.cmdb.getReleaseCmdbList(aProjectUri, function (err, list) {
                cmdbList = list;
                done(err);
            });
        });

        s.push(function (done) {
            getReleasesByCmdbList(cmdbList, function (err, rlist) {
                releases = rlist;
                done(err);
            });
        });

        var outerReleasesUriList;
        s.push(function (done) {
            populateAssociation(releases, function (err, alist) {
                associations = alist;
                var mapRelease = {};
                alist.forEach(function (a) {
                    if (a.type.name == 'derived') {
                        mapRelease[a.to.uri] = null;
                    }
                });
                outerReleasesUriList = Object.keys(mapRelease);
                done(err);
            });
        });

        var outerReleases;
        s.push(function (done) {
            getItems(outerReleasesUriList, function (err, items) {
                releases = releases.concat(items);
                outerReleases = items;
                done(err);
            });
        });

        var outerItemUriList = [];
        s.push(function (done) {
            populateReferences(outerReleases, function (err, references) {
                references.forEach(function (i) {
                    outerItemUriList.push(i.uri);
                });
                done(err);
            });
        });

        async.series(s, function (err) {
            aCb(err, cmdbList, releases, associations, outerItemUriList);
        });
    }

    function getTaskInfoByProject(aProjectUri, aCb) {
        console.log('getTaskInfoByProject');

        var s = [];
        var trackers;
        var tasks;
        var associations;

        s.push(function (done) {
            Cb.tracker.getTaskTrackers(aProjectUri, function (err, tlist) {
                trackers = tlist;
                done(err);
            });
        });

        s.push(function (done) {
            getTasksByTrackers(trackers, function (err, tlist) {
                tasks = tlist;
                done(err);
            });
        });

        s.push(function (done) {
            populateAssociation(tasks, function (err, alist) {
                associations = alist;
                done(err);
            });
        });

        async.series(s, function (err) {
            aCb(err, trackers, tasks, associations);
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

    function populateAssociation(aItems, aCb) {
        console.log('populateAssociation');

        var p = [];

        var associations = [];

        aItems.forEach(function (i) {
            p.push(function (done) {
                Cb.association.getAllAssociationByTypes(i.uri, ['depends', 'child', 'parent', 'derived'], function (err, items) {
                    if (items && items.length) {
                        i._associations = items;
                        associations = associations.concat(items);
                    }
                    done(err);
                });
            });
        });

        async.parallel(p, function (err) {
            aCb(err, associations);
        });
    }

    function populateReferences(aItems, aCb) {
        console.log('populateReferences');

        var p = [];

        var references = [];

        aItems.forEach(function (i) {
            p.push(function (done) {
                Cb.item.getReferences(i.uri, function (err, items) {
                    i._references = items;
                    references = references.concat(items);
                    done();
                });
            });
        });

        async.parallel(p, function (err) {
            aCb(err, references);
        });
    }

    function getProjectInfo(aProjectUri, aCb) {
        var p = [];
        var releaseCmdbList;
        var releaseList;
        var outerItemUriList;
        var taskTrackerList;
        var tasks;
        var associations = [];

        p.push(function (done) {
            getReleasesInfoByProject(aProjectUri, function (err, clist, rlist, alist, urilist) {
                releaseCmdbList = clist;
                releaseList = rlist;
                associations = associations.concat(alist);
                outerItemUriList = urilist;
                done(err);
            });
        });

        p.push(function (done) {
            getTaskInfoByProject(aProjectUri, function (err, trklist, tlist, alist) {
                taskTrackerList = trklist;
                tasks = tlist;
                associations = associations.concat(alist);
                done(err);
            });
        });

        async.parallel(p, function (err) {
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
    CbUtils.getReleaseUriListFromTask = getReleaseUriListFromTask;

    var CCbCache = (function () {
        function CCbCache() {
            this._cache = {};
            this._userMap = {};
            this._projectMap = {};
            this._trackerMap = {};
            this._itemMap = {};
        }
        CCbCache.prototype.getProject = function (aProjectUri) {
            return this._projectMap[aProjectUri];
        };

        CCbCache.prototype.getAllMaps = function () {
            return {
                projectMap: this._projectMap,
                userMap: this._userMap,
                trackerMap: this._trackerMap,
                itemMap: this._itemMap
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

            var itemMap = this._itemMap;

            var release;
            var tasks;
            var userUriList;
            var trackerUriList = [];
            var outerReleaseUriList;
            var outerItemUriList;
            s.push(function (done) {
                getProjectInfo(aProjectUri, function (err, projectInfo) {
                    release = projectInfo.releaseList;
                    tasks = projectInfo.tasks;
                    outerItemUriList = projectInfo.outerItemUriList;

                    projectInfo.taskTrackerList.forEach(function (t) {
                        trackerUriList.push(t.uri);
                    });

                    projectInfo.releaseList.forEach(function (r) {
                        r._type = 2 /* Release */;
                        itemMap[r.uri] = r;
                    });

                    var mapUser = {};
                    var mapRelease = {};
                    projectInfo.tasks.forEach(function (t) {
                        itemMap[t.uri] = t;

                        if (t.assignedTo) {
                            t.assignedTo.forEach(function (u) {
                                mapUser[u.uri] = null;
                            });
                        }

                        var releaseUriList = getReleaseUriListFromTask(t);
                        if (releaseUriList) {
                            releaseUriList.forEach(function (ruri) {
                                mapRelease[ruri] = null;
                            });
                        }
                    });
                    userUriList = Object.keys(mapUser);
                    outerReleaseUriList = Object.keys(mapRelease);

                    var mapAssociation = {};
                    projectInfo.associations.forEach(function (a) {
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
            s.push(function (done) {
                getItems(outerItemUriList, function (err, ilist) {
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
                        itemMap[item.uri] = item;
                        if (item['assignedTo']) {
                            item['assignedTo'].forEach(function (u) {
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

            s.push(function (done) {
                async.parallel([
                    function (done) {
                        getItems(outerReleaseUriList, function (err, ilist) {
                            ilist.forEach(function (release) {
                                release._type = 2 /* Release */;
                                itemMap[release.uri] = release;
                            });
                            done();
                        });
                    },
                    function (done) {
                        getItems(trackerUriList.concat(outerTrackerUriList), function (err, ilist) {
                            ilist.forEach(function (tracker) {
                                trackerMap[tracker.uri] = tracker;
                            });
                            done(err);
                        });
                    },
                    function (done) {
                        getItems(userUriList.concat(outerUserUriList), function (err, ilist) {
                            ilist.forEach(function (i) {
                                userMap[i.uri] = i;
                            });
                            done();
                        });
                    },
                    function (done) {
                        getItems([aProjectUri].concat(outerProjectUriList), function (err, ilist) {
                            ilist.forEach(function (i) {
                                projectMap[i.uri] = i;
                            });
                            done();
                        });
                    }
                ], function (err) {
                    done(err);
                });
            });

            async.series(s, function (err) {
                var outerTasks = [];
                outerItems.forEach(function (item) {
                    var tracker = trackerMap[item.tracker.uri];
                    if (tracker.type.name == 'Task') {
                        outerTasks.push(item);
                    }
                });

                var ret = {
                    releases: release,
                    tasks: tasks,
                    outerTasks: outerTasks
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

    (function (TFilterType) {
        TFilterType[TFilterType["None"] = 0x00] = "None";
        TFilterType[TFilterType["ByWithoutCompletedTask"] = 0x01] = "ByWithoutCompletedTask";
        TFilterType[TFilterType["ByFromPast2Weeks"] = 0x02] = "ByFromPast2Weeks";
    })(CbUtils.TFilterType || (CbUtils.TFilterType = {}));
    var TFilterType = CbUtils.TFilterType;

    (function (TSortingType) {
        TSortingType[TSortingType["None"] = 0] = "None";
        TSortingType[TSortingType["ByStartTime"] = 1] = "ByStartTime";
        TSortingType[TSortingType["ByStartTimeDsc"] = 2] = "ByStartTimeDsc";
        TSortingType[TSortingType["ByEndTime"] = 3] = "ByEndTime";
        TSortingType[TSortingType["ByEndTimeDsc"] = 4] = "ByEndTimeDsc";
        TSortingType[TSortingType["BySubmittedTime"] = 5] = "BySubmittedTime";
        TSortingType[TSortingType["BySubmittedTimeDsc"] = 6] = "BySubmittedTimeDsc";
        TSortingType[TSortingType["ByModifiedTime"] = 7] = "ByModifiedTime";
        TSortingType[TSortingType["ByModifiedTimeDsc"] = 8] = "ByModifiedTimeDsc";
    })(CbUtils.TSortingType || (CbUtils.TSortingType = {}));
    var TSortingType = CbUtils.TSortingType;
})(CbUtils || (CbUtils = {}));
//# sourceMappingURL=CodeBeamer.js.map
