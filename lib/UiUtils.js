/// <reference path="../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="CodeBeamer.ts"/>
/// <reference path="DhxExt.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var UiUtils;
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

        dhxTask._data = aCbItem;

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
        return aAllMaps.trackerMap[aTask.tracker.uri]['_projectUri'] || aAllMaps.trackerMap[aTask.tracker.uri].project.uri;
    };
    KGroupKeyIdentifiers[3 /* BySprint */] = function (aAllMaps, aTask) {
        var ret = KUnknownIdentifier;
        if (aTask._type == 2 /* Release */) {
            return KIgnoreIdentifier;
        }
        var releaseUriList = CbUtils.getReleaseUriListFromTask(aTask);
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

            aCb(err, {
                data: tasks,
                links: links
            }, markers);
        });
    }
    UiUtils.getDhxDataByProject = getDhxDataByProject;

    function getDhxDataByUser(aUserUri, aGroupings, aFilter, aSorting, aCb) {
        var s = [];
        var cachedUserInfo;

        s.push(function (done) {
            CbUtils.cache.getCachedUserInfo(aUserUri, function (err, cache) {
                cachedUserInfo = cache;
                done(err);
            });
        });

        var tasks;
        var links;
        s.push(function (done) {
            var allMaps = CbUtils.cache.getAllMaps();
            var cbTasks = [];

            cbTasks = cbTasks.concat(cachedUserInfo.tasks);

            var groupTasks = processGrouping(allMaps, cbTasks, aGroupings, 0);
            tasks = getTasks(groupTasks);
            links = processLinks(allMaps, cbTasks);

            done();
        });

        async.series(s, function (err) {
            aCb(err, {
                data: tasks,
                links: links
            });
        });
    }
    UiUtils.getDhxDataByUser = getDhxDataByUser;

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

    var CAngularContext = (function (_super) {
        __extends(CAngularContext, _super);
        function CAngularContext($scope) {
            var _this = this;
            _super.call(this);
            this._$scope = $scope;

            $scope.$on('$destroy', function () {
                _this.destroy();
            });
        }
        return CAngularContext;
    })(DhxExt.CContext);
    UiUtils.CAngularContext = CAngularContext;

    (function (ModalHelper) {
        var hdxWins = new dhtmlXWindows();
        var dialog;

        function init(aTopElementId) {
            hdxWins.attachViewportTo('ganttCbProject');
        }
        ModalHelper.init = init;

        function showModal(aMessage) {
            dialog = hdxWins.createWindow({
                id: 'progress',
                left: 20,
                top: 30,
                width: 300,
                height: 100,
                modal: true,
                center: true,
                header: false,
                caption: 'Please wait...'
            });
            dialog.setModal(true);
            dialog.progressOn();
            dialog.attachHTMLString('<p>' + aMessage + '</p>');
            dialog.show();
        }
        ModalHelper.showModal = showModal;

        function closeModal() {
            dialog.close();
        }
        ModalHelper.closeModal = closeModal;
    })(UiUtils.ModalHelper || (UiUtils.ModalHelper = {}));
    var ModalHelper = UiUtils.ModalHelper;

    (function (UserHelper) {
        function getUserPage(aText, aCb) {
            Cb.user.getPage(1, aText, function (err, userPage) {
                if (err) {
                    return;
                }

                var items = [];
                userPage.users.forEach(function (user) {
                    items.push({
                        id: user.uri,
                        text: user.name
                    });
                });
                aCb(items);
            });
        }

        function create(aContext, aEl, aInitialId, aOnChange) {
            var cbUser = new DhxExt.CCombo(aEl, getUserPage);

            cbUser.onChange = function (id) {
                console.log('onChange', id);
                if (id === aInitialId) {
                    return;
                }
                aOnChange(id);
            };

            Cb.user.getByUri(aInitialId, function (err, user) {
                if (err || !user) {
                    getUserPage('', function (items) {
                        cbUser.setItems(items);
                        cbUser.openSelect();
                    });
                } else {
                    cbUser.setItems([{
                            id: user.uri,
                            text: user.name
                        }]);

                    cbUser.selectItemById(user.uri);
                }
            });

            aContext.addComponent(cbUser);
        }
        UserHelper.create = create;
    })(UiUtils.UserHelper || (UiUtils.UserHelper = {}));
    var UserHelper = UiUtils.UserHelper;

    (function (SortHelper) {
        var KSortIdNone = 'sort_none';
        var KSortIdStartTimeAsc = 'sort_start_date_asc';
        var KSortIdStartTimeDsc = 'sort_start_date_dsc';
        var KSortIdEndTimeAsc = 'sort_end_date_asc';
        var KSortIdEndTimeDsc = 'sort_end_date_dsc';
        var KSortIdSubmittedTimeAsc = 'sort_submitted_date_asc';
        var KSortIdSubmittedTimeDsc = 'sort_submitted_date_dsc';
        var KSortIdModifiedTimeAsc = 'sort_modified_date_asc';
        var KSortIdModifiedTimeDsc = 'sort_modified_date_dsc';

        var KAvailableIdList = [
            KSortIdNone,
            KSortIdStartTimeAsc,
            KSortIdStartTimeDsc,
            KSortIdEndTimeAsc,
            KSortIdEndTimeDsc,
            KSortIdSubmittedTimeAsc,
            KSortIdSubmittedTimeDsc,
            KSortIdModifiedTimeAsc,
            KSortIdModifiedTimeDsc
        ];

        var KSortingTypeById = {};
        KSortingTypeById[KSortIdNone] = 0 /* None */;
        KSortingTypeById[KSortIdStartTimeAsc] = 1 /* ByStartTime */;
        KSortingTypeById[KSortIdStartTimeDsc] = 2 /* ByStartTimeDsc */;
        KSortingTypeById[KSortIdEndTimeAsc] = 3 /* ByEndTime */;
        KSortingTypeById[KSortIdEndTimeDsc] = 4 /* ByEndTimeDsc */;
        KSortingTypeById[KSortIdSubmittedTimeAsc] = 5 /* BySubmittedTime */;
        KSortingTypeById[KSortIdSubmittedTimeDsc] = 6 /* BySubmittedTimeDsc */;
        KSortingTypeById[KSortIdModifiedTimeAsc] = 7 /* ByModifiedTime */;
        KSortingTypeById[KSortIdModifiedTimeDsc] = 8 /* ByModifiedTimeDsc */;

        var KComboItems = [
            {
                id: KSortIdNone,
                text: 'None'
            }, {
                id: KSortIdStartTimeAsc,
                text: 'Start date \u25B2'
            }, {
                id: KSortIdStartTimeDsc,
                text: 'Start date \u25BC'
            }, {
                id: KSortIdEndTimeAsc,
                text: 'End date \u25B2'
            }, {
                id: KSortIdEndTimeDsc,
                text: 'End date \u25BC'
            }, {
                id: KSortIdSubmittedTimeAsc,
                text: 'Submitted date \u25B2'
            }, {
                id: KSortIdSubmittedTimeDsc,
                text: 'Submitted date \u25BC'
            }, {
                id: KSortIdModifiedTimeAsc,
                text: 'Modified date \u25B2'
            }, {
                id: KSortIdModifiedTimeDsc,
                text: 'Modified date \u25BC'
            }];

        function isValidId(aId) {
            return KAvailableIdList.indexOf(aId) != -1;
        }

        function createCombo(aContext, aEl, aInitialId, aOnChange) {
            var cbSort = new DhxExt.CCombo(aEl);
            cbSort.setItems(KComboItems);
            if (aInitialId && isValidId(aInitialId)) {
                cbSort.selectItemById(aInitialId);
            } else {
                cbSort.selectItemById(KSortIdNone);
            }
            cbSort.onChange = function (id) {
                if (id != aInitialId) {
                    aOnChange(id);
                }
            };
            aContext.addComponent(cbSort);
        }
        SortHelper.createCombo = createCombo;

        function getSortType(aSortId) {
            return KSortingTypeById[aSortId];
        }
        SortHelper.getSortType = getSortType;
    })(UiUtils.SortHelper || (UiUtils.SortHelper = {}));
    var SortHelper = UiUtils.SortHelper;

    (function (GroupHelper) {
        var KIdNone = 'grp_none';
        var KIdUser = 'grp_user';
        var KIdProject = 'grp_project';
        var KIdRelease = 'grp_release';

        var KAvailableIdList = [
            KIdNone,
            KIdUser,
            KIdProject,
            KIdRelease
        ];

        var KGroupingItems = [
            {
                id: KIdNone,
                text: 'None'
            }, {
                id: KIdUser,
                text: 'By user'
            }, {
                id: KIdProject,
                text: 'By project'
            }, {
                id: KIdRelease,
                text: 'By release'
            }];

        var KGroupTypeById = {};
        KGroupTypeById[KIdUser] = 1 /* ByUser */;
        KGroupTypeById[KIdProject] = 2 /* ByProject */;
        KGroupTypeById[KIdRelease] = 3 /* BySprint */;

        function createComboForProject(aContext, aElList, aInitialValues, aOnSelect) {
            createCombo(aContext, KGroupingItems, aElList, aInitialValues, aOnSelect);
        }
        GroupHelper.createComboForProject = createComboForProject;

        function createComboForUser(aContext, aElList, aInitialValues, aOnSelect) {
            var forUser = KGroupingItems.slice(0);
            forUser.slice(1);
            createCombo(aContext, KGroupingItems, aElList, aInitialValues, aOnSelect);
        }
        GroupHelper.createComboForUser = createComboForUser;

        function isValidId(aId) {
            return KAvailableIdList.indexOf(aId) != -1;
        }

        function removeItem(aItems, aId) {
            var index = -1, i, len = aItems.length;
            for (i = 0; i < len; i++) {
                if (aItems[i].id == aId) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                aItems.splice(index, 1);
            }
        }

        function createCombo(aContext, aComboItems, aElList, aInitialValues, aOnSelect) {
            var comboItems = aComboItems.slice(0);
            var initialValues = aInitialValues.slice(0);

            aElList.forEach(function (el, i) {
                var cb = new DhxExt.CCombo(el);
                cb.setItems(comboItems);
                var initialValue = initialValues[i];
                if (initialValue && isValidId(initialValue)) {
                    cb.selectItemById(initialValue);
                    removeItem(comboItems, initialValue);
                } else {
                    cb.selectItemById(KIdNone);
                }
                cb.onChange = function (id) {
                    if (id != initialValue) {
                        initialValues[i] = id;
                        aOnSelect(initialValues);
                    }
                };
                aContext.addComponent(cb);
            });
        }

        function getGroupings(aGroups) {
            var groupings = [];
            aGroups.forEach(function (groupingId) {
                if (KGroupTypeById[groupingId]) {
                    groupings.push(KGroupTypeById[groupingId]);
                }
            });
            return groupings;
        }
        GroupHelper.getGroupings = getGroupings;
    })(UiUtils.GroupHelper || (UiUtils.GroupHelper = {}));
    var GroupHelper = UiUtils.GroupHelper;

    (function (ScaleHelper) {
        var KIdDay = 'day';
        var KIdWeek = 'week';
        var KIdMonth = 'month';
        var KIdYear = 'year';

        var KAvailableIdList = [
            KIdDay,
            KIdWeek,
            KIdMonth,
            KIdYear
        ];

        var KItems = [
            {
                id: KIdDay,
                text: '일'
            }, {
                id: KIdWeek,
                text: '주'
            }, {
                id: KIdMonth,
                text: '월'
            }, {
                id: KIdYear,
                text: '년'
            }];

        function isValidId(aId) {
            return KAvailableIdList.indexOf(aId) != -1;
        }

        function createCombo(aContext, aEl, aInitialId, aOnChange) {
            var combo = new DhxExt.CCombo(aEl);
            combo.setItems(KItems);
            if (aInitialId && isValidId(aInitialId)) {
                combo.selectItemById(aInitialId);
            } else {
                combo.selectItemById(KIdWeek);
            }
            combo.onChange = function (id) {
                if (id != aInitialId) {
                    aOnChange(id);
                }
            };
        }
        ScaleHelper.createCombo = createCombo;
    })(UiUtils.ScaleHelper || (UiUtils.ScaleHelper = {}));
    var ScaleHelper = UiUtils.ScaleHelper;

    (function (FilterHelper) {
        var KIdWithoutCompletedTask = 'fid_wo_task';

        var KAvailableIdList = [KIdWithoutCompletedTask];

        var KFilterItems = [{
                name: KIdWithoutCompletedTask,
                type: 'checkbox',
                label: 'Hide Completed Tasks'
            }];

        function isValidId(aId) {
            return KAvailableIdList.indexOf(aId) != -1;
        }

        function normalizeInitialFilters(aInitialFilters) {
            var ret = aInitialFilters.slice(0), i, len = ret.length;
            for (i = len - 1; i >= len; i--) {
                if (!isValidId(ret[i])) {
                    ret.splice(i, 1);
                }
            }
            return ret;
        }

        function create(aContext, aEl, aInitialFilters, aOnChanged) {
            var initialFilters = normalizeInitialFilters(aInitialFilters);

            var filterItems = KFilterItems.slice(0);
            filterItems.forEach(function (item) {
                item.checked = initialFilters.indexOf(item.name) != -1;
                item.eventHandlers = {
                    onChange: function (value, state) {
                        var prevIndex = initialFilters.indexOf(item.name);
                        var prevState = prevIndex != -1;
                        if (state != prevState) {
                            if (state) {
                                initialFilters.push(item.name);
                            } else {
                                initialFilters.splice(prevIndex);
                            }
                            aOnChanged(initialFilters);
                        }
                    }
                };
            });

            var form = new DhxExt.CForm(aEl, filterItems);
            aContext.addComponent(form);
        }
        FilterHelper.create = create;

        function getFilterType(aFilters) {
            var filterTypeById = {};
            filterTypeById[KIdWithoutCompletedTask] = 1 /* ByWithoutCompletedTask */;
            var filters = 0 /* None */;
            aFilters.forEach(function (filterId) {
                filters = filters | filterTypeById[filterId];
            });
            return filters;
        }
        FilterHelper.getFilterType = getFilterType;
    })(UiUtils.FilterHelper || (UiUtils.FilterHelper = {}));
    var FilterHelper = UiUtils.FilterHelper;
})(UiUtils || (UiUtils = {}));
//# sourceMappingURL=UiUtils.js.map
