
/// <reference path="../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="CodeBeamer.ts"/>
/// <reference path="DhxExt.ts"/>

declare var dhtmlXWindows;

module UiUtils {

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
        'End-of-Life': '#187a6d',
        'Resolved': '#00a85d'
    };

    var KCompletedStatusValues = ['Closed', 'Completed', 'Released'];

    interface IValidityChecker {
        name: string;
        checker: (aTask: DhxGantt.TTask) => string;
    }

    var KValidityCheckers: IValidityChecker[] = [{
        name: 'End date',
        checker: function(dhxTask: DhxGantt.TTask) {

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

    function covertCbItemToDhxTask(aAllMaps: CbUtils.TAllMaps, aCbItem: Cb.TItem, aLogPadding: string, aParentUri: string): DhxGantt.TTask {

        var cbTask: Cb.TTask = <Cb.TTask>aCbItem;
        var cbRelease: Cb.TRelease = <Cb.TRelease>aCbItem;

        var dhxTask: DhxGantt.TTask = {
            id: cbTask.uri,
            text: cbTask.name,
            start_date: new Date(cbTask.startDate || cbTask.submittedAt),
            progress: cbTask.spentEstimatedHours || 0,
            priority: cbTask.priority ? cbTask.priority.name: 'Normal',
            _status: cbTask.status ? cbTask.status.name: 'None',
            estimatedMillis: cbTask.estimatedMillis,
            estimatedDays: Math.ceil(cbTask.estimatedMillis / unitWorkingDay)
        };

        if (cbRelease.plannedReleaseDate) {
            dhxTask.start_date = new Date(cbRelease.plannedReleaseDate);
            dhxTask.end_date = dhxTask.start_date;
            dhxTask._type = DhxGanttExt.TTaskType.Release;
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
//            if (!dhxTask.duration || dhxTask.duration < 1) {
//                dhxTask.duration = 1;
//            }

        if (aParentUri) {
            dhxTask.parent = aParentUri;
        } else if (cbTask.parent && aAllMaps.itemMap[cbTask.parent.uri]) {
            dhxTask.parent = cbTask.parent.uri;
        } else if (cbRelease._parentReleaseUri) {
            dhxTask.parent = cbRelease._parentReleaseUri;
        }

        console.log(aLogPadding, aCbItem.uri, dhxTask.parent);

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
        KValidityCheckers.forEach(function(validityCheckers) {
            var ret = validityCheckers.checker(dhxTask);
            if (ret) {
                warnings.push(ret);
            }
        });

        dhxTask._warnings = warnings.length ? warnings: null;

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

    function convertCbTasksToDhxTasks(aAllMaps: CbUtils.TAllMaps, aCbTasks: Cb.TTask[], aLogPadding: string, aParentUri?: string): DhxGantt.TTask[] {

        var siblings = [];
        aCbTasks.forEach(function(cbTask) {
            siblings.push(cbTask.uri);
        });

        var dhxTasks = [];
        aCbTasks.forEach(function(cbTask) {
            var parentUri = cbTask.parent ? cbTask.parent.uri : null;
            var parentId = parentUri && siblings.indexOf(parentUri) != -1 ? parentUri: aParentUri;
            dhxTasks.push(covertCbItemToDhxTask(aAllMaps, cbTask, aLogPadding, parentId));
        });
        return dhxTasks;
    }

    interface TGroupTask extends DhxGantt.TTask {
        groupType?: CbUtils.TGroupType;
        child?: TGroupTask[];
    }

    var KUnknownIdentifier = 'UNKNOWN';
    var KIgnoreIdentifier = 'IGNORE';
    var KSelfIdnetifier = 'SELF';
    var KGroupKeyIdentifiers: {[type: number]: (aAllMaps: CbUtils.TAllMaps, aItem: Cb.TItem) => string} = {};
    KGroupKeyIdentifiers[CbUtils.TGroupType.ByUser] = function(aAllMaps: CbUtils.TAllMaps, aItem: Cb.TItem) {
        var ret = KUnknownIdentifier;
        var task = <Cb.TTask>aItem
        if (task.assignedTo) {
            ret = task.assignedTo[0].uri;
            if (task.assignedTo.length != 1) {
                console.warn('More than one user');
                console.warn(task);
            }
        }
        return ret;
    };
    KGroupKeyIdentifiers[CbUtils.TGroupType.ByProject] = function(aAllMaps: CbUtils.TAllMaps, aItem: Cb.TItem) {
        var task = <Cb.TTask>aItem;
        return aItem._projectUri || aAllMaps.trackerMap[task.tracker.uri]['_projectUri'] || aAllMaps.trackerMap[task.tracker.uri].project.uri;
    };
    KGroupKeyIdentifiers[CbUtils.TGroupType.BySprint] = function(aAllMaps: CbUtils.TAllMaps, aItem: Cb.TItem) {
        var ret = KUnknownIdentifier;
        if (aItem._type == Cb.TItemType.Release) {
            var release = <Cb.TRelease> aItem;
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

    var KGroupConverters: { [type: number]: (aAllMaps: CbUtils.TAllMaps, aUri: string, aLoggingPadding: string, aParentId: string) => DhxGantt.TTask } = {};
    KGroupConverters[CbUtils.TGroupType.ByUser] = function(aAllMaps: CbUtils.TAllMaps, aUri: string, aLoggingPadding: string, aParentId: string): DhxGantt.TTask {
        var user = aAllMaps.userMap[aUri];
        return {
            id: user.uri,
            text: getUserName(user),
            user: '-',
            type: gantt.config.types.project,
            _type: DhxGanttExt.TTaskType.User
        };
    };
    KGroupConverters[CbUtils.TGroupType.ByProject] = function(aAllMaps: CbUtils.TAllMaps, aUri: string, aLoggingPadding: string, aParentId: string): DhxGantt.TTask {
        var project = aAllMaps.projectMap[aUri];
        return {
            id: project.uri,
            text: project.name,
            user: '-',
            type: gantt.config.types.project,
            _type: DhxGanttExt.TTaskType.Project
        };
    };
    KGroupConverters[CbUtils.TGroupType.BySprint] = function(aAllMaps: CbUtils.TAllMaps, aUri: string, aLoggingPadding: string, aParentId: string): DhxGantt.TTask {
        var release: Cb.TRelease = aAllMaps.itemMap[aUri];
        return covertCbItemToDhxTask(aAllMaps, release, aLoggingPadding, aParentId);
    };

    var KUnknownConverter = {};
    KUnknownConverter[CbUtils.TGroupType.ByUser] = function() {
        return {
            id: '__unknown_user__',
            text: 'User not assigned',
            user: '-',
            type: gantt.config.types.project,
            _type: DhxGanttExt.TTaskType.User
        };
    };
    KUnknownConverter[CbUtils.TGroupType.ByProject] = function() {
        return null;
    };
    KUnknownConverter[CbUtils.TGroupType.BySprint] = function() {
        return {
            id: '__unknown_release__',
            text: 'Relase not assigned',
            user: '-',
            type: gantt.config.types.project,
            _type: DhxGanttExt.TTaskType.Release
        };
    };

    var debug_duplication = true;

    function processGrouping(
            aAllMaps: CbUtils.TAllMaps,
            aTasks: Cb.TTask[],
            aGroupings: CbUtils.TGroupType[],
            aDepth: number,
            aParentId?: string): TGroupTask[] {


        if (debug_duplication) {
            var mapTask = {}
            aTasks.forEach(function(t) {
                if (mapTask[t.uri]) {
                    debugger;
                }
                mapTask[t.uri] = true;
            });
        }

        var type = aGroupings[aDepth];
        var ret = [];
        var log_padding = '';
        for (var i=0; i<aDepth; i++) {
            log_padding = log_padding + '  ';
        }
        if (type) {
            var groupKeyIdentifier = KGroupKeyIdentifiers[type];
            var map = {};
            aTasks.forEach(function(t) {
                var key = groupKeyIdentifier(aAllMaps, t);
                if (key == KSelfIdnetifier) {
                    if (!map[t.uri]) {
                        map[t.uri] = [];
                    }
                } else if (map[key]) {
                    map[key].push(t);
                } else {
                    map[key] = [t];
                }
            });

            var groupConverter = KGroupConverters[type];
            var unknownTask: TGroupTask = KUnknownConverter[type]();
            var groupKeys = Object.keys(map);

            console.log('processGrouping: depth=' + aDepth + ', type=' + type + ', count=' + groupKeys.length);

            groupKeys.forEach(function(key) {

                if (key == KIgnoreIdentifier) {
                    return;
                }

                var task: TGroupTask;
                if (key == KUnknownIdentifier) {
                    task = unknownTask;
                } else {
                    task = groupConverter(aAllMaps, key, log_padding, aParentId);
                }
                if (aParentId) {
                    task.parent = aParentId;
                    task.id = aParentId + '>' + task.id;
                }
                console.log(log_padding + task.id);
                task.child = processGrouping(
                    aAllMaps,
                    map[key],
                    aGroupings,
                        aDepth + 1,
                    task.id);
                ret.push(task);
            });

        } else {
            ret = convertCbTasksToDhxTasks(aAllMaps, aTasks, log_padding, aParentId);
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

    function processLinks(aAllMaps: CbUtils.TAllMaps, aTasks: Cb.TTask[]): DhxGantt.TLink[] {
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

    function generatePropertyStringFilter(aPropOrder: string[], aValues: any[], aInclude: boolean) {
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

    function generatePropertyArrayFilter(aFirstPropName: string, aSecondPropName: string, aValues: any[], aInclude: boolean) {
        return function(obj) {

            var match = false;

            // FIXME: quick fix for skipping release
            if (obj.plannedReleaseDate) {
                return true;
            }

            obj = obj[aFirstPropName];
            if (obj instanceof Array) {
                var i, iLen = obj.length;

                if (iLen) {
                    for (i=0; i<iLen; i++) {
                        if (aValues.indexOf(obj[i][aSecondPropName]) !== -1) {
                            match = true;
                            break;
                        }
                    }
                }

            }

            return aInclude ? match: !match;
        }
    }

    function generatePropertySorter(aProp: string, aAscending: boolean, aCompare, ...aAlternative: string[]) {
        return function(objA, objB) {
            var varA = objA[aProp] || objA[aAlternative[0]] || objA[aAlternative[1]],
                varB = objB[aProp] || objB[aAlternative[0]] || objB[aAlternative[1]];
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
    KSorterByType[CbUtils.TSortingType.ByStartTime] = generatePropertySorter('startDate', true, dateStringCompare, 'plannedReleaseDate', 'submittedAt');
    KSorterByType[CbUtils.TSortingType.ByStartTimeDsc] = generatePropertySorter('startDate', false, dateStringCompare, 'plannedReleaseDate', 'submittedAt');
    KSorterByType[CbUtils.TSortingType.ByEndTime] = generatePropertySorter('endDate', true, dateStringCompare, 'plannedReleaseDate', 'submittedAt');
    KSorterByType[CbUtils.TSortingType.ByEndTimeDsc] = generatePropertySorter('endDate', false, dateStringCompare, 'plannedReleaseDate', 'submittedAt');
    KSorterByType[CbUtils.TSortingType.BySubmittedTime] = generatePropertySorter('submittedAt', true, dateStringCompare);
    KSorterByType[CbUtils.TSortingType.BySubmittedTimeDsc] = generatePropertySorter('submittedAt', false, dateStringCompare);
    KSorterByType[CbUtils.TSortingType.ByModifiedTime] = generatePropertySorter('modifiedAt', true, dateStringCompare);
    KSorterByType[CbUtils.TSortingType.ByModifiedTimeDsc] = generatePropertySorter('modifiedAt', false, dateStringCompare);

    function generateSorter(aType: CbUtils.TSortingType) {
        return KSorterByType[aType];
    }

    export function getDhxDataByProject(
        aProjectUri: string,
        aGroupings: CbUtils.TGroupType[],
        aFilter: CbUtils.TFilterType,
        aSorting: CbUtils.TSortingType,
        aCb: (err, aDhxData: DhxExt.Gantt.TData) => void ) {

        var s = [];

        var cachedProjectInfo: CbUtils.TCachedProjectInfo;
        s.push(function(done) {
            CbUtils.cache.getCachedProjectInfo(aProjectUri, function(err, cached) {
                console.log('getDhxDataByProject');

                cachedProjectInfo = cached;

                done(err);
            });
        });

        var tasks;
        var links;
        s.push(function(done) {

            var allMaps = CbUtils.cache.getAllMaps();

            var cbTasks: any[] = cachedProjectInfo.releases.slice(0);
//                var cbTasks = [];
            cbTasks = cbTasks.concat(cachedProjectInfo.tasks);
            cbTasks = cbTasks.concat(cachedProjectInfo.outerTasks);

            var filters = [];
            if (aFilter & CbUtils.TFilterType.ByWithoutCompletedTask) {
                filters.push(generatePropertyStringFilter(['status', 'name'], KCompletedStatusValues, false));
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

            aCb(err, {
                data: tasks,
                links: links
            });
        });

    }

    export function getDhxDataByUser(
        aUserUri: string,
        aGroupings: CbUtils.TGroupType[],
        aFilter: CbUtils.TFilterType,
        aSorting: CbUtils.TSortingType,
        aCb: (err, aDhxData: DhxExt.Gantt.TData) => void ) {

        var s = [];
        var cachedUserInfo: CbUtils.TCachedUserInfo;

        s.push(function(done) {
            CbUtils.cache.getCachedUserInfo(aUserUri, function(err, cache) {
                cachedUserInfo = cache;
                done(err);
            });
        });

        var tasks;
        var links;
        s.push(function(done) {

            var allMaps = CbUtils.cache.getAllMaps();
            var cbTasks = [];

            cbTasks = cbTasks.concat(cachedUserInfo.tasks);
            cbTasks = cbTasks.concat(cachedUserInfo.releases);

            var filters = [];
            if (aFilter & CbUtils.TFilterType.ByWithoutCompletedTask) {
                filters.push(generatePropertyStringFilter(['status', 'name'], KCompletedStatusValues, false));
                filters.push(generatePropertyArrayFilter('assignedTo', 'uri', [aUserUri], true));
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
            aCb(err, {
                data: tasks,
                links: links
            });
        });

    }

    export function roundDay(aDate: Date) {
        return new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
    }

    export function addDays(aDate: Date, aDays: number) {
        return new Date(aDate.getTime() + unitDay * aDays);
    }

    export function getPast7DateFromNow() {
        return addDays(roundDay(new Date()), -7);
    }

    export class CAngularContext extends DhxExt.CContext {

        _$scope: any;

        constructor($scope) {
            super();
            this._$scope = $scope;

            $scope.$on('$destroy', () => {
                this.destroy();
            });
        }
    }

    export module ModalHelper {

        var hdxWins = new dhtmlXWindows();
        var dialog;

        export function init(aTopElementId: string) {
            hdxWins.attachViewportTo('ganttCbProject');
        }

        export function showModal(aMessage: string) {
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
            dialog.attachHTMLString('<p>' + aMessage +'</p>');
            dialog.show();
        }

        export function closeModal() {
            dialog.close();
        }
    }

    export module ProjectHelper {

        function getProjectPage(aText, aCb) {
            Cb.project.getPage(1, aText, function(err, projectPage) {
                if (err) {
                    return;
                }

                var items = [];
                projectPage.projects.forEach(function(project) {
                    items.push({
                        id: project.uri,
                        text: project.name
                    });
                });
                aCb(items);
            });
        }

        export function create(aContext: CAngularContext, aEl: HTMLElement, aInitialId: string, aOnChange: DhxExt.FnComboOnChange) {

            var cbProject = new DhxExt.CCombo(aEl, getProjectPage);

            cbProject.onChange = function (id) {
                console.log('onChange', id);
                if (id === aInitialId) {
                    return;
                }
                aOnChange(id);
            };

            Cb.project.getByUri(aInitialId, function(err, project) {
                if (err || !project) {
                    getProjectPage('', function(items) {
                        cbProject.setItems(items);
                        cbProject.openSelect();
                    });
                } else {
                    cbProject.setItems([{
                        id: project.uri,
                        text: project.name
                    }]);

                    cbProject.selectItemById(project.uri);
                }
            });

            aContext.addComponent(cbProject);
        }

    }

    export module UserHelper {

        function getUserPage(aText, aCb) {
            Cb.user.getPage(1, aText, function(err, userPage) {
                if (err) {
                    return;
                }

                var items = [];
                userPage.users.forEach(function(user) {
                    items.push({
                        id: user.uri,
                        text: getUserName(user)
                    });
                });
                aCb(items);
            });
        }

        export function create(aContext: CAngularContext, aEl: HTMLElement, aInitialId: string, aOnChange: DhxExt.FnComboOnChange) {

            var cbUser = new DhxExt.CCombo(aEl, getUserPage);

            cbUser.onChange = function (id) {
                console.log('onChange', id);
                if (id === aInitialId) {
                    return;
                }
                aOnChange(id);
            };

            Cb.user.getByUri(aInitialId, function(err, user) {
                if (err || !user) {
                    getUserPage('', function(items) {
                        cbUser.setItems(items);
                        cbUser.openSelect();
                    });
                } else {
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

    }

    export module SortHelper {
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
        KSortingTypeById[KSortIdNone] = CbUtils.TSortingType.None;
        KSortingTypeById[KSortIdStartTimeAsc] = CbUtils.TSortingType.ByStartTime;
        KSortingTypeById[KSortIdStartTimeDsc] = CbUtils.TSortingType.ByStartTimeDsc;
        KSortingTypeById[KSortIdEndTimeAsc] = CbUtils.TSortingType.ByEndTime;
        KSortingTypeById[KSortIdEndTimeDsc] = CbUtils.TSortingType.ByEndTimeDsc;
        KSortingTypeById[KSortIdSubmittedTimeAsc] = CbUtils.TSortingType.BySubmittedTime;
        KSortingTypeById[KSortIdSubmittedTimeDsc] = CbUtils.TSortingType.BySubmittedTimeDsc;
        KSortingTypeById[KSortIdModifiedTimeAsc] = CbUtils.TSortingType.ByModifiedTime;
        KSortingTypeById[KSortIdModifiedTimeDsc] = CbUtils.TSortingType.ByModifiedTimeDsc;

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

        export function createCombo(
                aContext: DhxExt.CContext,
                aEl: HTMLElement,
                aInitialId: string,
                aOnChange: DhxExt.FnComboOnChange) {
            var cbSort = new DhxExt.CCombo(aEl);
            cbSort.setItems(KComboItems);
            if (aInitialId && isValidId(aInitialId)) {
                cbSort.selectItemById(aInitialId);
            } else {
                cbSort.selectItemById(KSortIdNone);
            }
            cbSort.onChange = function(id) {
                if (id != aInitialId) {
                    aOnChange(id);
                }
            };
            aContext.addComponent(cbSort);
        }

        export function getSortType(aSortId: string) {
            return KSortingTypeById[aSortId];
        }
    }

    export module GroupHelper {

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

        var KGroupingItems: DhxExt.TComboItem[] = [{
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
        KGroupTypeById[KIdUser] = CbUtils.TGroupType.ByUser;
        KGroupTypeById[KIdProject] = CbUtils.TGroupType.ByProject;
        KGroupTypeById[KIdRelease] = CbUtils.TGroupType.BySprint;

        export interface FnGroupComboSelect {
            (aSelections: string[]): void;
        }

        export function createComboForProject(aContext: CAngularContext, aElList: HTMLElement[], aInitialValues: string[], aOnSelect: FnGroupComboSelect) {
            createCombo(aContext, KGroupingItems, aElList, aInitialValues, aOnSelect);
        }

        export function createComboForUser(aContext: CAngularContext, aElList: HTMLElement[], aInitialValues: string[], aOnSelect: FnGroupComboSelect) {
            var forUser = KGroupingItems.slice(0);
            forUser.slice(1);
            createCombo(aContext, KGroupingItems, aElList, aInitialValues, aOnSelect);
        }

        function isValidId(aId: string) {
            return KAvailableIdList.indexOf(aId) != -1;
        }

        function removeItem(aItems: DhxExt.TComboItem[], aId: string) {
            var index = -1, i, len=aItems.length;
            for (i=0; i<len; i++) {
                if (aItems[i].id == aId) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                aItems.splice(index, 1);
            }
        }

        function createCombo(
                aContext: CAngularContext,
                aComboItems: DhxExt.TComboItem[],
                aElList: HTMLElement[],
                aInitialValues: string[],
                aOnSelect: FnGroupComboSelect) {

            var comboItems = aComboItems.slice(0);
            var initialValues = aInitialValues.slice(0);

            aElList.forEach(function(el, i) {
                var cb = new DhxExt.CCombo(el);
                cb.setItems(comboItems);
                var initialValue = initialValues[i];
                if (initialValue && isValidId(initialValue)) {
                    cb.selectItemById(initialValue);
                    removeItem(comboItems, initialValue);
                } else {
                    cb.selectItemById(KIdNone);
                }
                cb.onChange = function(id) {
                    if (id != initialValue) {
                        initialValues[i] = id;
                        aOnSelect(initialValues);
                    }
                };
                aContext.addComponent(cb);
            });
        }

        export function getGroupings(aGroups: string[]) {
            var groupings = [];
            aGroups.forEach(function(groupingId) {
                if (KGroupTypeById[groupingId]) {
                    groupings.push(KGroupTypeById[groupingId]);
                }
            });
            return groupings;
        }
    }

    export module ScaleHelper {

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

        function isValidId(aId: string) {
            return KAvailableIdList.indexOf(aId) != -1;
        }

        export function createCombo(aContext: CAngularContext, aEl: HTMLElement, aInitialId: string, aOnChange: DhxExt.FnComboOnChange) {

            var combo = new DhxExt.CCombo(aEl);
            combo.setItems(KItems);
            if (aInitialId && isValidId(aInitialId)) {
                combo.selectItemById(aInitialId);
            } else {
                combo.selectItemById(KIdWeek);
            }
            combo.onChange = function(id) {
                if (id != aInitialId) {
                    aOnChange(id);
                }
            };
        }

    }

    export module FilterHelper {

        var KIdWithoutCompletedTask = 'fid_wo_task';

        var KAvailableIdList = [KIdWithoutCompletedTask];

        var KFilterItems: DhxExt.TFormItem[] = [{
            name: KIdWithoutCompletedTask,
            type: 'checkbox',
            label: 'Hide Completed Tasks'
        }];

        function isValidId(aId: string) {
            return KAvailableIdList.indexOf(aId) != -1;
        }

        function normalizeInitialFilters(aInitialFilters) {
            var ret = aInitialFilters.slice(0), i, len = ret.length;
            for (i=len-1; i>=len; i--) {
                if (!isValidId(ret[i])) {
                    ret.splice(i, 1);
                }
            }
            return ret;
        }

        export interface FnFilterChanged {
            (aFilters: string[]): void;
        }

        export function create(
                aContext: CAngularContext,
                aEl: HTMLElement,
                aInitialFilters: string[],
                aOnChanged: FnFilterChanged) {

            var initialFilters = normalizeInitialFilters(aInitialFilters);

            var filterItems = KFilterItems.slice(0);
            filterItems.forEach(function(item) {
                item.checked = initialFilters.indexOf(item.name) != -1;
                item.eventHandlers = {
                    onChange: function(value, state) {
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
                }
            });

            var form = new DhxExt.CForm(aEl, filterItems);
            aContext.addComponent(form);
        }

        export function getFilterType(aFilters: string[]) {
            var filterTypeById = {};
            filterTypeById[KIdWithoutCompletedTask] = CbUtils.TFilterType.ByWithoutCompletedTask;
            var filters: CbUtils.TFilterType = CbUtils.TFilterType.None;
            aFilters.forEach(function(filterId) {
                filters = filters | filterTypeById[filterId];
            });
            return filters;
        }
    }

    function get_holiday_awared_task(aTask: DhxExt.Gantt.TTask, aMode: string): Cb.TTask {
        var holidayAwared = holidayAwareness? CalendarUtils.getStartAndEndDate(aTask.start_date, aTask.estimatedMillis): {
            start: aTask.start_date,
            end: aTask.end_date
        };

        var task: any = {
            uri: aTask.id,
            name: aTask.text,
            startDate: holidayAwared.start
        };
        if (aMode === 'resize') { // by dragging end date only changes end date
            task.endDate = aTask.end_date;
        } else if (aMode === 'move') { // by dragging task bar, apply holiday awareness by estimatedMillis
            task.endDate = holidayAwared.end;
        } else if (aMode === 'progress') { // by dragging progress bar, do nothing
        } else { // by duration change in light box, apply holiday awareness
            task.estimatedMillis = aTask.duration * unitWorkingDay;
            if (holidayAwareness) {
                task.endDate = CalendarUtils.getStartAndEndDate(aTask.start_date, aTask.duration * unitWorkingDay).end;
            } else {
                task.endDate = holidayAwared.end;
            }
        }
        if (aTask.progress) {
            task.spentMillis = Math.round(aTask.estimatedMillis * aTask.progress);
        }
        return task;
    }

    export class CCbGantt extends DhxExt.Gantt.CGantt {

        private _projectUri: string;
        private _userUri: string;
        private _groupings: CbUtils.TGroupType[];
        private _filter: CbUtils.TFilterType;
        private _sorting: CbUtils.TSortingType;
        private _openedTaskMap;

        constructor(aEl: HTMLElement, aReadOnly: boolean) {
            super(aEl, aReadOnly);

            var openedTaskMap = localStorage.getItem('openedTaskMap');

            this._openedTaskMap = openedTaskMap ? JSON.parse(openedTaskMap) : {};

            this.doIsValidNewTask = (id, task) => {
                return this._doIsValidNewTask(id, task);
            };

            this.handleNewTaskAdded = (id, task) => {
                var now = new Date();
                var start = roundDay(addDays(now, 1));
                var end = roundDay(addDays(now, 2));
                task.start_date = start;
                task.end_date = end;
                this._gantt.updateTask(id, task);
                return true;
            };

            this.onBeforeTaskAdd = (id, task) => {
                this._onBeforeTaskAdd(id, task);
            };
            this.onAfterTaskAdd = (id, task) => {
                this._onAfterTaskAdd(id, task);
            };
            this.onAfterTaskUpdate = (taskId, task, changeMode) => {
                this._onAfterTaskUpdate(taskId, task, changeMode);
            };
            this.onAfterTaskDelete = (taskId, task) => {
                this._onAfterTaskDelete(taskId, task);
            };
            this.onTaskOpened = (id) => {
                this._openedTaskMap[id] = true;
                localStorage.setItem('openedTaskMap', JSON.stringify(this._openedTaskMap));
            };
            this.onTaskClosed = (id) => {
                delete this._openedTaskMap[id];
                localStorage.setItem('openedTaskMap', JSON.stringify(this._openedTaskMap));
            };

            this.setToolTipProvider(function(start,end,task){
                var ret = '';
                ret += '<p><b>' + task.text + ' (' + task.id  + ')</b></p>';
                ret += '<hr>';

                if (task._warnings) {
                    task._warnings.forEach(function(w) {
                        ret += '<p class="warning">' + w + '</p>';
                    });
                }

                ret += '<p>' + DhxGanttExt.formatDate(start) + ' - ' + DhxGanttExt.formatDate(end) + ' (' + task.duration + ')</p>';
                return ret;
            });

            //window.addEventListener('beforeunload', function(e) {
            //    debugger;
            //});
            window.onbeforeunload = (e) => {
                var scrollState = this._gantt.getScrollState();
                localStorage.setItem('scrollStateBeforeUnload', JSON.stringify(scrollState));
            };
        }

        showTaskByProject(
            aProjectUri: string,
            aGroupings: CbUtils.TGroupType[],
            aFilter: CbUtils.TFilterType,
            aSorting: CbUtils.TSortingType,
            aScale: string,
            aCb: () => void) {

            this._projectUri = aProjectUri;
            this._groupings = aGroupings;
            this._filter = aFilter;
            this._sorting = aSorting;

            DhxGanttExt.setScale(aScale);

            this._update(aCb);
        }

        showTaskByUser(
            aUserUri: string,
            aGroupings: CbUtils.TGroupType[],
            aFilter: CbUtils.TFilterType,
            aSorting: CbUtils.TSortingType,
            aScale: string,
            aCb: () => void) {

            this._userUri = aUserUri;
            this._groupings = aGroupings;
            this._filter = aFilter;
            this._sorting = aSorting;

            DhxGanttExt.setScale(aScale);

            this._update(aCb);
        }

        private _processDependsTasks(aTask: DhxExt.Gantt.TTask, aCb, aLoopFunc: (aPrecedentTask: DhxExt.Gantt.TTask, aTask: DhxExt.Gantt.TTask, aCb) => void) {
            var series = [];
            var dependentTaskId = [];
            if (aTask.$source && aTask.$source.length) {
                aTask.$source.forEach((linkId) => {
                    var link = this._gantt.getLink(linkId);
                    if (link.type === '0') {
                        dependentTaskId.push(link.target);
                    }
                });
            }

            dependentTaskId.forEach((taskId: string) => {
                var task = this._gantt.getTask(taskId);
                if (task) {
                    series.push((cb) => {
                        aLoopFunc(aTask, task, (err) => {
                            if (err) {
                                cb(err);
                                return;
                            }
                            this._processDependsTasks(task, cb, aLoopFunc);
                        });
                    });
                }
            });
            async.series(series, function(err) {
                aCb(err);
            });
        }

        adjustDependentTasks(aTaskId, aCb) {
            var task = this._gantt.getTask(aTaskId);
            var allMap = CbUtils.cache.getAllMaps();
            this._processDependsTasks(task,
                () => {
                    aCb();
                },
                (precedentTask, task, aCb) => {
                    task.start_date = precedentTask.end_date;
                    var adjusted_task = get_holiday_awared_task(task, "move");
                    CbUtils.cache.updateTask(this._userUri, adjusted_task, (err, resp) => {
                        if (!err) {
                            var task_from_cb = covertCbItemToDhxTask(allMap, resp, '', task.parent);
                            task.start_date = task_from_cb.start_date;
                            task.estimatedMillis = task_from_cb.estimatedMillis;
                            task.progress = task_from_cb.progress;
                            task.end_date = task_from_cb.end_date;
                            this._gantt.refreshTask(task.id);
                        }
                        aCb(err);
                    });
                }
            );
        }

        refreshTask(aTaskId, aCb) {
            var task = this._gantt.getTask(aTaskId);
            CbUtils.cache.refreshTask(this._userUri, task._data, (err, cbTask) => {
                this._update();
                aCb(err);
            });
        }

        private _update(aCb?) {

            if (this._projectUri) {
                UiUtils.getDhxDataByProject(this._projectUri, this._groupings, this._filter, this._sorting, (err, resp) => {

                    var prev_date = DhxGanttExt.getCenteredDate();

                    var opened_task_ids = Object.keys(this._openedTaskMap);

                    resp.data.forEach(function(t) {

                        if (opened_task_ids.indexOf(t.id) != -1) {
                            t.open = true;
                        }

                    });

                    this.parse(resp);

                    setTimeout(function() {
                        DhxGanttExt.setDateCentered(prev_date || new Date());
                    }, 5);

                    if (aCb) {
                        aCb();
                    }
                });
            }

            if (this._userUri) {
                UiUtils.getDhxDataByUser(this._userUri, this._groupings, this._filter, this._sorting, (err, resp) => {

                    var prev_date = DhxGanttExt.getCenteredDate();

                    var opened_task_ids = Object.keys(this._openedTaskMap);

                    resp.data.forEach(function(t) {

                        if (opened_task_ids.indexOf(t.id) != -1) {
                            t.open = true;
                        }

                    });

                    this.parse(resp);

                    var scrollStateBeforeUnload = JSON.parse(localStorage.getItem('scrollStateBeforeUnload'));
                    if (scrollStateBeforeUnload) {
                        localStorage.removeItem('scrollStateBeforeUnload');
                        this._gantt.scrollTo(scrollStateBeforeUnload.x, scrollStateBeforeUnload.y);
                    }

                    setTimeout(function() {
                        DhxGanttExt.setDateCentered(prev_date || new Date());
                    }, 5);

                    if (aCb) {
                        aCb();
                    }
                });
            }
        }

        private _showMessage(aMessage: string) {
            DhxExt.error(aMessage);
        }

        private _doIsValidNewTask(aTaskId: string, aTask: DhxExt.Gantt.TTask): boolean {

            /* if user mode */
            if (this._userUri && aTask.$new) {
                if (!aTask.parent) {
                    this._showMessage('You cannot add task from top level.');
                    this._gantt.deleteTask(aTaskId);
                    return false;
                } else {
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
        }

        private _onBeforeTaskAdd(aTaskId: string, aTask: DhxExt.Gantt.TTask) {
            return true;
        }

        private _onAfterTaskAdd(aTaskId: string, aTask: DhxExt.Gantt.TTask) {

            console.log('_onAfterTaskAdd', aTaskId);

            var newCbTask: any = {
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
                var parentTask = <Cb.TTask><any>CbUtils.cache.getItem(aTask.parent);
                if (parentTask) {
                    trackerUri = parentTask.tracker.uri;
                    parentUri = aTask.parent;
                } else {
                    var trackers = CbUtils.cache.getTrackersByProject(aTask.parent);
                    trackerUri = trackers[0].uri;
                }

                if (parentUri) {
                    newCbTask.parent = parentUri;
                }
                if (trackerUri) {
                    newCbTask.tracker = trackerUri;
                } else {
                    debugger;
                }
            }

            CbUtils.cache.createTask(this._userUri, newCbTask, (err, task) => {

                if (task) {

                    this._gantt.selectTask(aTaskId);

                    this._gantt.changeTaskId(aTaskId, task.uri);
                }

                this._update();
            });

        }

        private _onAfterTaskUpdate(aTaskId: string, aTask: DhxExt.Gantt.TTask, aChangeMode: string) {

            console.log('_onAfterTaskUpdate', aTaskId);

            var updateTask = get_holiday_awared_task(aTask, aChangeMode);

            CbUtils.cache.updateTask(this._userUri, updateTask, (err, task) => {

                this._update();
            });

        }

        private _onAfterTaskDelete(aTaskId: string, aTask: DhxExt.Gantt.TTask) {

            console.log('_onAfterTaskDelete', aTaskId);

            if (typeof aTaskId === "number") {
                return;
            }

            CbUtils.cache.deleteTask(this._userUri, aTaskId, (err) => {

                this._update();
            });

        }

    }

}
