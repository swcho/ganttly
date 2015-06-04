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
    var KCompletedStatusValues = ['Closed', 'Completed', 'Released'];
    var KValidityCheckers = [{
        name: 'End date',
        checker: function (dhxTask) {
            if (KCompletedStatusValues.indexOf(dhxTask._status) !== -1) {
                return null;
            }
            if (!dhxTask._status) {
                return "Status is not configured";
            }
            if (!dhxTask.end_date) {
                return 'End date is not configured';
            }
            if (dhxTask.end_date < new Date()) {
                return "End date is overdue.";
            }
            return null;
        }
    }];
    function covertCbItemToDhxTask(aAllMaps, aCbItem, aLogPadding, aParentUri) {
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
            dhxTask.end_date = dhxTask.start_date;
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
        }
        else if (cbTask.parent && aAllMaps.itemMap[cbTask.parent.uri]) {
            dhxTask.parent = cbTask.parent.uri;
        }
        else if (cbRelease._parentReleaseUri) {
            dhxTask.parent = cbRelease._parentReleaseUri;
        }
        console.log(aLogPadding, aCbItem.uri, dhxTask.parent);
        // color
        if (cbTask.status) {
            if (cbTask.status.style) {
                dhxTask.color = cbTask.status.style;
            }
            else {
                dhxTask.color = default_color[cbTask.status.name];
            }
        }
        else {
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
        //        if (aCbItem._associations) {
        //            aCbItem._associations.forEach(function(a) {
        //
        //                if (a.type.name == 'depends') {
        //
        //                    if (!dhxTask._depends) {
        //                        dhxTask._depends = [];
        //                    }
        //                    dhxTask._depends.push();
        //                    debugger;
        //                }
        //
        //            });
        //        }
        return dhxTask;
    }
    function convertCbTasksToDhxTasks(aAllMaps, aCbTasks, aLogPadding, aParentUri) {
        var siblings = [];
        aCbTasks.forEach(function (cbTask) {
            siblings.push(cbTask.uri);
        });
        var dhxTasks = [];
        aCbTasks.forEach(function (cbTask) {
            var parentUri = cbTask.parent ? cbTask.parent.uri : null;
            var parentId = parentUri && siblings.indexOf(parentUri) != -1 ? parentUri : aParentUri;
            dhxTasks.push(covertCbItemToDhxTask(aAllMaps, cbTask, aLogPadding, parentId));
        });
        return dhxTasks;
    }
    var KUnknownIdentifier = 'UNKNOWN';
    var KIgnoreIdentifier = 'IGNORE';
    var KSelfIdnetifier = 'SELF';
    var KGroupKeyIdentifiers = {};
    KGroupKeyIdentifiers[1 /* ByUser */] = function (aAllMaps, aItem) {
        var ret = KUnknownIdentifier;
        var task = aItem;
        if (task.assignedTo) {
            ret = task.assignedTo[0].uri;
            if (task.assignedTo.length != 1) {
                console.warn('More than one user');
                console.warn(task);
            }
        }
        return ret;
    };
    KGroupKeyIdentifiers[2 /* ByProject */] = function (aAllMaps, aItem) {
        var task = aItem;
        return aItem._projectUri || aAllMaps.trackerMap[task.tracker.uri]['_projectUri'] || aAllMaps.trackerMap[task.tracker.uri].project.uri;
    };
    KGroupKeyIdentifiers[3 /* BySprint */] = function (aAllMaps, aItem) {
        var ret = KUnknownIdentifier;
        if (aItem._type == 2 /* Release */) {
            var release = aItem;
            return release._parentReleaseUri || KSelfIdnetifier;
        }
        var releaseUriList = CbUtils.getReleaseUriListFromTask(aItem);
        if (releaseUriList) {
            ret = releaseUriList[0];
            if (releaseUriList.length != 1) {
                console.warn('More than one release');
                console.warn(aItem);
            }
        }
        return ret;
    };
    var KGroupConverters = {};
    KGroupConverters[1 /* ByUser */] = function (aAllMaps, aUri, aLoggingPadding, aParentId) {
        var user = aAllMaps.userMap[aUri];
        return {
            id: user.uri,
            text: getUserName(user),
            user: '-',
            type: gantt.config.types.project,
            _type: 1 /* User */
        };
    };
    KGroupConverters[2 /* ByProject */] = function (aAllMaps, aUri, aLoggingPadding, aParentId) {
        var project = aAllMaps.projectMap[aUri];
        return {
            id: project.uri,
            text: project.name,
            user: '-',
            type: gantt.config.types.project,
            _type: 2 /* Project */
        };
    };
    KGroupConverters[3 /* BySprint */] = function (aAllMaps, aUri, aLoggingPadding, aParentId) {
        var release = aAllMaps.itemMap[aUri];
        return covertCbItemToDhxTask(aAllMaps, release, aLoggingPadding, aParentId);
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
    var debug_duplication = true;
    function processGrouping(aAllMaps, aTasks, aGroupings, aDepth, aParentId) {
        if (debug_duplication) {
            var mapTask = {};
            aTasks.forEach(function (t) {
                if (mapTask[t.uri]) {
                    debugger;
                }
                mapTask[t.uri] = true;
            });
        }
        var type = aGroupings[aDepth];
        var ret = [];
        var log_padding = '';
        for (var i = 0; i < aDepth; i++) {
            log_padding = log_padding + '  ';
        }
        if (type) {
            var groupKeyIdentifier = KGroupKeyIdentifiers[type];
            var map = {};
            aTasks.forEach(function (t) {
                var key = groupKeyIdentifier(aAllMaps, t);
                if (key == KSelfIdnetifier) {
                    if (!map[t.uri]) {
                        map[t.uri] = [];
                    }
                }
                else if (map[key]) {
                    map[key].push(t);
                }
                else {
                    map[key] = [t];
                }
            });
            var groupConverter = KGroupConverters[type];
            var unknownTask = KUnknownConverter[type]();
            var groupKeys = Object.keys(map);
            console.log('processGrouping: depth=' + aDepth + ', type=' + type + ', count=' + groupKeys.length);
            groupKeys.forEach(function (key) {
                if (key == KIgnoreIdentifier) {
                    return;
                }
                var task;
                if (key == KUnknownIdentifier) {
                    task = unknownTask;
                }
                else {
                    task = groupConverter(aAllMaps, key, log_padding, aParentId);
                }
                if (aParentId) {
                    task.parent = aParentId;
                    task.id = aParentId + '>' + task.id;
                }
                console.log(log_padding + task.id);
                task.child = processGrouping(aAllMaps, map[key], aGroupings, aDepth + 1, task.id);
                ret.push(task);
            });
        }
        else {
            ret = convertCbTasksToDhxTasks(aAllMaps, aTasks, log_padding, aParentId);
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
                    try {
                        if (a.type.name == 'depends') {
                            ret.push({
                                id: a.uri,
                                source: a.to.uri,
                                target: a.from.uri,
                                type: '0'
                            });
                        }
                        else if (a.type.name == 'child') {
                            ret.push({
                                id: a.uri,
                                source: a.from.uri,
                                target: a.to.uri,
                                type: '1'
                            });
                        }
                        else if (a.type.name == 'parent') {
                            ret.push({
                                id: a.uri,
                                source: a.from.uri,
                                target: a.to.uri,
                                type: '1'
                            });
                        }
                        else if (a.type.name == 'derived') {
                            ret.push({
                                id: a.uri,
                                source: a.to.uri,
                                target: a.from.uri,
                                type: '0'
                            });
                        }
                    }
                    catch (e) {
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
    function generatePropertyStringFilter(aPropOrder, aValues, aInclude) {
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
    function generatePropertyArrayFilter(aFirstPropName, aSecondPropName, aValues, aInclude) {
        return function (obj) {
            var match = false;
            // FIXME: quick fix for skipping release
            if (obj.plannedReleaseDate) {
                return true;
            }
            obj = obj[aFirstPropName];
            if (obj instanceof Array) {
                var i, iLen = obj.length;
                if (iLen) {
                    for (i = 0; i < iLen; i++) {
                        if (aValues.indexOf(obj[i][aSecondPropName]) !== -1) {
                            match = true;
                            break;
                        }
                    }
                }
            }
            return aInclude ? match : !match;
        };
    }
    function generatePropertySorter(aProp, aAscending, aCompare) {
        var aAlternative = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            aAlternative[_i - 3] = arguments[_i];
        }
        return function (objA, objB) {
            var varA = objA[aProp] || objA[aAlternative[0]] || objA[aAlternative[1]], varB = objB[aProp] || objB[aAlternative[0]] || objB[aAlternative[1]];
            if (aAscending) {
                return aCompare ? aCompare(varA, varB) : varA - varB;
            }
            else {
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
    KSorterByType[3 /* ByEndTime */] = generatePropertySorter('endDate', true, dateStringCompare, 'plannedReleaseDate', 'submittedAt');
    KSorterByType[4 /* ByEndTimeDsc */] = generatePropertySorter('endDate', false, dateStringCompare, 'plannedReleaseDate', 'submittedAt');
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
                filters.push(generatePropertyStringFilter(['status', 'name'], KCompletedStatusValues, false));
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
            });
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
            cbTasks = cbTasks.concat(cachedUserInfo.releases);
            var filters = [];
            if (aFilter & 1 /* ByWithoutCompletedTask */) {
                filters.push(generatePropertyStringFilter(['status', 'name'], KCompletedStatusValues, false));
                filters.push(generatePropertyArrayFilter('assignedTo', 'uri', [aUserUri], true));
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
    var ModalHelper;
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
    })(ModalHelper = UiUtils.ModalHelper || (UiUtils.ModalHelper = {}));
    var ProjectHelper;
    (function (ProjectHelper) {
        function getProjectPage(aText, aCb) {
            Cb.project.getPage(1, aText, function (err, projectPage) {
                if (err) {
                    return;
                }
                var items = [];
                projectPage.projects.forEach(function (project) {
                    items.push({
                        id: project.uri,
                        text: project.name
                    });
                });
                aCb(items);
            });
        }
        function create(aContext, aEl, aInitialId, aOnChange) {
            var cbProject = new DhxExt.CCombo(aEl, getProjectPage);
            cbProject.onChange = function (id) {
                console.log('onChange', id);
                if (id === aInitialId) {
                    return;
                }
                aOnChange(id);
            };
            Cb.project.getByUri(aInitialId, function (err, project) {
                if (err || !project) {
                    getProjectPage('', function (items) {
                        cbProject.setItems(items);
                        cbProject.openSelect();
                    });
                }
                else {
                    cbProject.setItems([{
                        id: project.uri,
                        text: project.name
                    }]);
                    cbProject.selectItemById(project.uri);
                }
            });
            aContext.addComponent(cbProject);
        }
        ProjectHelper.create = create;
    })(ProjectHelper = UiUtils.ProjectHelper || (UiUtils.ProjectHelper = {}));
    var UserHelper;
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
                        text: getUserName(user)
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
                }
                else {
                    var userName = getUserName(user);
                    cbUser.setItems([{
                        id: user.uri,
                        text: userName
                    }]);
                    document.title = userName + ' - simply gently ganttly';
                    cbUser.selectItemById(user.uri);
                }
            });
            aContext.addComponent(cbUser);
        }
        UserHelper.create = create;
    })(UserHelper = UiUtils.UserHelper || (UiUtils.UserHelper = {}));
    var SortHelper;
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
        var KComboItems = [{
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
            }
            else {
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
    })(SortHelper = UiUtils.SortHelper || (UiUtils.SortHelper = {}));
    var GroupHelper;
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
        var KGroupingItems = [{
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
                }
                else {
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
    })(GroupHelper = UiUtils.GroupHelper || (UiUtils.GroupHelper = {}));
    var ScaleHelper;
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
        var KItems = [{
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
            }
            else {
                combo.selectItemById(KIdWeek);
            }
            combo.onChange = function (id) {
                if (id != aInitialId) {
                    aOnChange(id);
                }
            };
        }
        ScaleHelper.createCombo = createCombo;
    })(ScaleHelper = UiUtils.ScaleHelper || (UiUtils.ScaleHelper = {}));
    var FilterHelper;
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
                            }
                            else {
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
    })(FilterHelper = UiUtils.FilterHelper || (UiUtils.FilterHelper = {}));
    function get_holiday_awared_task(aTask, aMode) {
        var holidayAwared = holidayAwareness ? CalendarUtils.getStartAndEndDate(aTask.start_date, aTask.estimatedMillis) : {
            start: aTask.start_date,
            end: aTask.end_date
        };
        var task = {
            uri: aTask.id,
            name: aTask.text,
            startDate: holidayAwared.start
        };
        if (aMode === 'resize') {
            task.endDate = aTask.end_date;
        }
        else if (aMode === 'move') {
            task.endDate = holidayAwared.end;
        }
        else if (aMode === 'progress') {
        }
        else {
            task.estimatedMillis = aTask.duration * unitWorkingDay;
            if (holidayAwareness) {
                task.endDate = CalendarUtils.getStartAndEndDate(aTask.start_date, aTask.duration * unitWorkingDay).end;
            }
            else {
                task.endDate = holidayAwared.end;
            }
        }
        if (aTask.progress) {
            task.spentMillis = Math.round(aTask.estimatedMillis * aTask.progress);
        }
        return task;
    }
    var CCbGantt = (function (_super) {
        __extends(CCbGantt, _super);
        function CCbGantt(aEl, aReadOnly) {
            var _this = this;
            _super.call(this, aEl, aReadOnly);
            var openedTaskMap = localStorage.getItem('openedTaskMap');
            this._openedTaskMap = openedTaskMap ? JSON.parse(openedTaskMap) : {};
            this.doIsValidNewTask = function (id, task) {
                return _this._doIsValidNewTask(id, task);
            };
            this.handleNewTaskAdded = function (id, task) {
                var now = new Date();
                var start = roundDay(addDays(now, 1));
                var end = roundDay(addDays(now, 2));
                task.start_date = start;
                task.end_date = end;
                _this._gantt.updateTask(id, task);
                return true;
            };
            this.onBeforeTaskAdd = function (id, task) {
                _this._onBeforeTaskAdd(id, task);
            };
            this.onAfterTaskAdd = function (id, task) {
                _this._onAfterTaskAdd(id, task);
            };
            this.onAfterTaskUpdate = function (taskId, task, changeMode) {
                _this._onAfterTaskUpdate(taskId, task, changeMode);
            };
            this.onAfterTaskDelete = function (taskId, task) {
                _this._onAfterTaskDelete(taskId, task);
            };
            this.onTaskOpened = function (id) {
                _this._openedTaskMap[id] = true;
                localStorage.setItem('openedTaskMap', JSON.stringify(_this._openedTaskMap));
            };
            this.onTaskClosed = function (id) {
                delete _this._openedTaskMap[id];
                localStorage.setItem('openedTaskMap', JSON.stringify(_this._openedTaskMap));
            };
            this.setToolTipProvider(function (start, end, task) {
                var ret = '';
                ret += '<p><b>' + task.text + ' (' + task.id + ')</b></p>';
                ret += '<hr>';
                if (task._warnings) {
                    task._warnings.forEach(function (w) {
                        ret += '<p class="warning">' + w + '</p>';
                    });
                }
                ret += '<p>' + DhxGanttExt.formatDate(start) + ' - ' + DhxGanttExt.formatDate(end) + ' (' + task.duration + ')</p>';
                return ret;
            });
            //window.addEventListener('beforeunload', function(e) {
            //    debugger;
            //});
            window.onbeforeunload = function (e) {
                var scrollState = _this._gantt.getScrollState();
                localStorage.setItem('scrollStateBeforeUnload', JSON.stringify(scrollState));
            };
        }
        CCbGantt.prototype.showTaskByProject = function (aProjectUri, aGroupings, aFilter, aSorting, aScale, aCb) {
            this._projectUri = aProjectUri;
            this._groupings = aGroupings;
            this._filter = aFilter;
            this._sorting = aSorting;
            DhxGanttExt.setScale(aScale);
            this._update(aCb);
        };
        CCbGantt.prototype.showTaskByUser = function (aUserUri, aGroupings, aFilter, aSorting, aScale, aCb) {
            this._userUri = aUserUri;
            this._groupings = aGroupings;
            this._filter = aFilter;
            this._sorting = aSorting;
            DhxGanttExt.setScale(aScale);
            this._update(aCb);
        };
        CCbGantt.prototype._processDependsTasks = function (aTask, aCb, aLoopFunc) {
            var _this = this;
            var series = [];
            var dependentTaskId = [];
            if (aTask.$source && aTask.$source.length) {
                aTask.$source.forEach(function (linkId) {
                    var link = _this._gantt.getLink(linkId);
                    if (link.type === '0') {
                        dependentTaskId.push(link.target);
                    }
                });
            }
            dependentTaskId.forEach(function (taskId) {
                var task = _this._gantt.getTask(taskId);
                if (task) {
                    series.push(function (cb) {
                        aLoopFunc(aTask, task, function (err) {
                            if (err) {
                                cb(err);
                                return;
                            }
                            _this._processDependsTasks(task, cb, aLoopFunc);
                        });
                    });
                }
            });
            async.series(series, function (err) {
                aCb(err);
            });
        };
        CCbGantt.prototype.adjustDependentTasks = function (aTaskId, aCb) {
            var _this = this;
            var task = this._gantt.getTask(aTaskId);
            var allMap = CbUtils.cache.getAllMaps();
            this._processDependsTasks(task, function () {
                aCb();
            }, function (precedentTask, task, aCb) {
                task.start_date = precedentTask.end_date;
                var adjusted_task = get_holiday_awared_task(task, "move");
                CbUtils.cache.updateTask(_this._userUri, adjusted_task, function (err, resp) {
                    if (!err) {
                        var task_from_cb = covertCbItemToDhxTask(allMap, resp, '', task.parent);
                        task.start_date = task_from_cb.start_date;
                        task.estimatedMillis = task_from_cb.estimatedMillis;
                        task.progress = task_from_cb.progress;
                        task.end_date = task_from_cb.end_date;
                        _this._gantt.refreshTask(task.id);
                    }
                    aCb(err);
                });
            });
        };
        CCbGantt.prototype.refreshTask = function (aTaskId, aCb) {
            var _this = this;
            var task = this._gantt.getTask(aTaskId);
            CbUtils.cache.refreshTask(this._userUri, task._data, function (err, cbTask) {
                _this._update();
                aCb(err);
            });
        };
        CCbGantt.prototype._update = function (aCb) {
            var _this = this;
            if (this._projectUri) {
                UiUtils.getDhxDataByProject(this._projectUri, this._groupings, this._filter, this._sorting, function (err, resp) {
                    var prev_date = DhxGanttExt.getCenteredDate();
                    var opened_task_ids = Object.keys(_this._openedTaskMap);
                    resp.data.forEach(function (t) {
                        if (opened_task_ids.indexOf(t.id) != -1) {
                            t.open = true;
                        }
                    });
                    _this.parse(resp);
                    setTimeout(function () {
                        DhxGanttExt.setDateCentered(prev_date || new Date());
                    }, 5);
                    if (aCb) {
                        aCb();
                    }
                });
            }
            if (this._userUri) {
                UiUtils.getDhxDataByUser(this._userUri, this._groupings, this._filter, this._sorting, function (err, resp) {
                    var prev_date = DhxGanttExt.getCenteredDate();
                    var opened_task_ids = Object.keys(_this._openedTaskMap);
                    resp.data.forEach(function (t) {
                        if (opened_task_ids.indexOf(t.id) != -1) {
                            t.open = true;
                        }
                    });
                    _this.parse(resp);
                    var scrollStateBeforeUnload = JSON.parse(localStorage.getItem('scrollStateBeforeUnload'));
                    if (scrollStateBeforeUnload) {
                        localStorage.removeItem('scrollStateBeforeUnload');
                        _this._gantt.scrollTo(scrollStateBeforeUnload.x, scrollStateBeforeUnload.y);
                    }
                    setTimeout(function () {
                        DhxGanttExt.setDateCentered(prev_date || new Date());
                    }, 5);
                    if (aCb) {
                        aCb();
                    }
                });
            }
        };
        CCbGantt.prototype._showMessage = function (aMessage) {
            DhxExt.error(aMessage);
        };
        CCbGantt.prototype._doIsValidNewTask = function (aTaskId, aTask) {
            /* if user mode */
            if (this._userUri && aTask.$new) {
                if (!aTask.parent) {
                    this._showMessage('You cannot add task from top level.');
                    this._gantt.deleteTask(aTaskId);
                    return false;
                }
                else {
                    //                    var parentTask = <Cb.TTask><any>CbUtils.cache.getItem(aTask.parent);
                    var trackers = CbUtils.cache.getTrackersByProject(aTask.parent);
                    if (1 < trackers.length) {
                        this._showMessage('You cannot add a project with multiple trackers.');
                        //this._gantt.deleteTask(aTaskId);
                        return false;
                    }
                }
            }
            return true;
        };
        CCbGantt.prototype._onBeforeTaskAdd = function (aTaskId, aTask) {
            return true;
        };
        CCbGantt.prototype._onAfterTaskAdd = function (aTaskId, aTask) {
            var _this = this;
            console.log('_onAfterTaskAdd', aTaskId);
            var newCbTask = {
                uri: null,
                name: aTask.text,
                startDate: aTask.start_date,
                description: aTask.text + '\n\nCreated by ganttly',
                descFormat: "html",
                estimatedMillis: aTask.duration * unitWorkingDay,
                endDate: aTask.end_date
            };
            if (aTask.parent) {
                var trackerUri;
                var parentUri;
                var parentTask = CbUtils.cache.getItem(aTask.parent);
                if (parentTask) {
                    trackerUri = parentTask.tracker.uri;
                    parentUri = aTask.parent;
                }
                else {
                    var trackers = CbUtils.cache.getTrackersByProject(aTask.parent);
                    trackerUri = trackers[0].uri;
                }
                if (parentUri) {
                    newCbTask.parent = parentUri;
                }
                if (trackerUri) {
                    newCbTask.tracker = trackerUri;
                }
                else {
                    debugger;
                }
            }
            CbUtils.cache.createTask(this._userUri, newCbTask, function (err, task) {
                if (task) {
                    _this._gantt.selectTask(aTaskId);
                    _this._gantt.changeTaskId(aTaskId, task.uri);
                }
                _this._update();
            });
        };
        CCbGantt.prototype._onAfterTaskUpdate = function (aTaskId, aTask, aChangeMode) {
            var _this = this;
            console.log('_onAfterTaskUpdate', aTaskId);
            var updateTask = get_holiday_awared_task(aTask, aChangeMode);
            CbUtils.cache.updateTask(this._userUri, updateTask, function (err, task) {
                _this._update();
            });
        };
        CCbGantt.prototype._onAfterTaskDelete = function (aTaskId, aTask) {
            var _this = this;
            console.log('_onAfterTaskDelete', aTaskId);
            if (typeof aTaskId === "number") {
                return;
            }
            CbUtils.cache.deleteTask(this._userUri, aTaskId, function (err) {
                _this._update();
            });
        };
        return CCbGantt;
    })(DhxExt.Gantt.CGantt);
    UiUtils.CCbGantt = CCbGantt;
})(UiUtils || (UiUtils = {}));
//# sourceMappingURL=UiUtils.js.map