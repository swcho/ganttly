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

        var default_color = {
            'New': '#b31317',
            'In progress': '#ffab46',
            'Partly completed': '#00a85d',
            'Completed': '#187a6d',
            'Closed': '#187a6d',
            'Suspended': '#00a85d',
            'Unreleased': '#ffab46',
            'Released': '#00a85d',
            'End-of-Life': '#187a6d',
            'Resolved': '#00a85d'
        };

        var KCompletedStatusValues = ['Closed', 'Completed'];

        var KValidityCheckers = [{
                name: 'End date',
                checker: function (dhxTask) {
                    if (!dhxTask._status) {
                        return "Status is not configured";
                    }

                    if (!dhxTask.end_date) {
                        return 'End date is not configured';
                    }

                    if (KCompletedStatusValues.indexOf(dhxTask._status) == -1 && dhxTask.end_date < new Date()) {
                        return "End date is overdue.";
                    }
                    return null;
                }
            }];

        function covertCbItemToDhxTask(aAllMaps, aCbItem, aParentUri) {
            var cbTask = aCbItem;
            var cbRelease = aCbItem;

            var dhxTask = {
                id: cbTask.uri,
                text: cbTask.name,
                start_date: new Date(cbTask.startDate || cbTask.submittedAt),
                progress: cbTask.spentEstimatedHours || 0,
                priority: cbTask.priority ? cbTask.priority.name : 'Normal',
                _status: cbTask.status ? cbTask.status.name : 'None',
                estimatedMillis: cbTask.estimatedMillis,
                estimatedDays: Math.ceil(cbTask.estimatedMillis / unitWorkingDay)
            };

            if (cbRelease.plannedReleaseDate) {
                dhxTask.start_date = new Date(cbRelease.plannedReleaseDate);
                dhxTask._type = 3 /* Release */;
                dhxTask.type = gantt.config.types.milestone;
            }

            var userNames = [];
            var userIdList = [];
            if (cbTask.assignedTo) {
                cbTask.assignedTo.forEach(function (user) {
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
            //            if (!dhxTask.duration || dhxTask.duration < 1) {
            //                dhxTask.duration = 1;
            //            }
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

            var warnings = [];
            KValidityCheckers.forEach(function (validityCheckers) {
                var ret = validityCheckers.checker(dhxTask);
                if (ret) {
                    warnings.push(ret);
                }
            });
            dhxTask._warnings = warnings.length ? warnings : null;

            return dhxTask;
        }

        function convertCbTasksToDhxTasks(aAllMaps, aCbTasks, aParentUri) {
            var dhxTasks = [];
            aCbTasks.forEach(function (cbTask) {
                dhxTasks.push(covertCbItemToDhxTask(aAllMaps, cbTask, aParentUri));
            });
            return dhxTasks;
        }

        var KUnknownIdentifier = 'UNKNOWN';
        var KIgnoreIdentifier = 'IGNORE';
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
            if (aTask._type == 2 /* Release */) {
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
        KGroupConverters[1 /* ByUser */] = function (aAllMaps, aUserUri) {
            var user = aAllMaps.userMap[aUserUri];
            return {
                id: user.uri,
                text: getUserName(user),
                user: '-',
                type: gantt.config.types.project,
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
                type: gantt.config.types.project,
                _type: 2 /* Project */
            };
        };
        KGroupConverters[3 /* BySprint */] = function (aAllMaps, aReleaseUri, aParentId) {
            var release = aAllMaps.itemMap[aReleaseUri];
            console.log(release);

            return covertCbItemToDhxTask(aAllMaps, release, aParentId);
            //            var ret: DhxGantt.TTask = {
            //                id: release.uri,
            //                text: release.name,
            //                user: '-',
            //                _type: DhxGanttExt.TTaskType.Release
            //            };
            //            if (release.parent) {
            //                var parentId = aParentId ? aParentId + '>' : '';
            //                ret.parent = parentId + release.parent.uri;
            //            }
            //            return ret;
        };

        var KUnknownConverter = {};
        KUnknownConverter[1 /* ByUser */] = function () {
            return {
                id: '__unknown_user__',
                text: 'User not assigned',
                user: '-',
                type: gantt.config.types.project,
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
                type: gantt.config.types.project,
                _type: 3 /* Release */
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
                    if (key == KIgnoreIdentifier) {
                        return;
                    }

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
                        try  {
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
                    task.release.forEach(function (r) {
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

        function generatePropertyFilter(aPropOrder, aValues, aInclude) {
            return function (obj) {
                var match = false, i, len = aPropOrder.length;

                for (i = 0; i < len; i++) {
                    obj = obj[aPropOrder[i]];
                    if (typeof obj == 'undefined') {
                        break;
                    }
                }

                if (i == len) {
                    len = aValues.length;
                    for (i = 0; i < len; i++) {
                        if (obj == aValues[i]) {
                            match = true;
                            break;
                        }
                    }
                }

                return aInclude ? match : !match;
            };
        }

        function generatePropertySorter(aProp, aAscending, aCompare) {
            var aAlternative = [];
            for (var _i = 0; _i < (arguments.length - 3); _i++) {
                aAlternative[_i] = arguments[_i + 3];
            }
            return function (objA, objB) {
                var varA = objA[aProp] || objA[aAlternative[0]] || objA[aAlternative[1]], varB = objB[aProp] || objB[aAlternative[0]] || objB[aAlternative[1]];
                if (aAscending) {
                    return aCompare ? aCompare(varA, varB) : varA - varB;
                } else {
                    return aCompare ? aCompare(varB, varA) : varB - varA;
                }
                return 0;
            };
        }

        function dateStringCompare(a, b) {
            return (new Date(a)).getTime() - (new Date(b)).getTime();
        }

        var KSorterByType = {};
        KSorterByType[1 /* ByStartTime */] = generatePropertySorter('startDate', true, dateStringCompare, 'plannedReleaseDate', 'submittedAt');
        KSorterByType[2 /* ByStartTimeDsc */] = generatePropertySorter('startDate', false, dateStringCompare, 'plannedReleaseDate', 'submittedAt');
        KSorterByType[3 /* ByEndTime */] = generatePropertySorter('endDate', true, dateStringCompare);
        KSorterByType[4 /* ByEndTimeDsc */] = generatePropertySorter('endDate', false, dateStringCompare);
        KSorterByType[5 /* BySubmittedTime */] = generatePropertySorter('submittedAt', true, dateStringCompare);
        KSorterByType[6 /* BySubmittedTimeDsc */] = generatePropertySorter('submittedAt', false, dateStringCompare);
        KSorterByType[7 /* ByModifiedTime */] = generatePropertySorter('modifiedAt', true, dateStringCompare);
        KSorterByType[8 /* ByModifiedTimeDsc */] = generatePropertySorter('modifiedAt', false, dateStringCompare);

        function generateSorter(aType) {
            return KSorterByType[aType];
        }

        function getDhxDataByProject(aProjectUri, aGroupings, aFilter, aSorting, aCb) {
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

                var cbTasks = cachedProjectInfo.releases.slice(0);

                //                var cbTasks = [];
                cbTasks = cbTasks.concat(cachedProjectInfo.tasks);
                cbTasks = cbTasks.concat(cachedProjectInfo.outerTasks);

                var filters = [];
                if (aFilter & 1 /* ByWithoutCompletedTask */) {
                    filters.push(generatePropertyFilter(['status', 'name'], KCompletedStatusValues, false));
                }
                filters.forEach(function (f) {
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

        function roundDay(aDate) {
            return new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
        }
        UiUtils.roundDay = roundDay;

        function addDays(aDate, aDays) {
            return new Date(aDate.getTime() + unitDay * aDays);
        }
        UiUtils.addDays = addDays;

        function getPast7DateFromNow() {
            return addDays(roundDay(new Date()), -7);
        }
        UiUtils.getPast7DateFromNow = getPast7DateFromNow;
    })(CbUtils.UiUtils || (CbUtils.UiUtils = {}));
    var UiUtils = CbUtils.UiUtils;
})(CbUtils || (CbUtils = {}));
//# sourceMappingURL=CodeBeamer.js.map
