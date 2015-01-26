
/// <reference path="../directive/dhxGantt/dhxGantt.ts"/>
/// <reference path="CodeBeamer.ts"/>

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

    var KCompletedStatusValues = ['Closed', 'Completed'];

    interface IValidityChecker {
        name: string;
        checker: (aTask: DhxGantt.TTask) => string;
    }

    var KValidityCheckers: IValidityChecker[] = [{
        name: 'End date',
        checker: function(dhxTask: DhxGantt.TTask) {

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

    function covertCbItemToDhxTask(aAllMaps: CbUtils.TAllMaps, aCbItem: Cb.TItem, aParentUri?: string): DhxGantt.TTask {

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
        KValidityCheckers.forEach(function(validityCheckers) {
            var ret = validityCheckers.checker(dhxTask);
            if (ret) {
                warnings.push(ret);
            }
        });

        dhxTask._warnings = warnings.length ? warnings: null;

        dhxTask._data = aCbItem;

        return dhxTask;
    }

    function convertCbTasksToDhxTasks(aAllMaps: CbUtils.TAllMaps, aCbTasks: Cb.TTask[], aParentUri?: string): DhxGantt.TTask[] {
        var dhxTasks = [];
        aCbTasks.forEach(function(cbTask) {
            dhxTasks.push(covertCbItemToDhxTask(aAllMaps, cbTask, aParentUri));
        });
        return dhxTasks;
    }

    interface TGroupTask extends DhxGantt.TTask {
        groupType?: CbUtils.TGroupType;
        child?: TGroupTask[];
    }

    var KUnknownIdentifier = 'UNKNOWN';
    var KIgnoreIdentifier = 'IGNORE';
    var KGroupKeyIdentifiers = {};
    KGroupKeyIdentifiers[CbUtils.TGroupType.ByUser] = function(aAllMaps: CbUtils.TAllMaps, aTask: Cb.TTask) {
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
    KGroupKeyIdentifiers[CbUtils.TGroupType.ByProject] = function(aAllMaps: CbUtils.TAllMaps, aTask: Cb.TTask) {
        return aAllMaps.trackerMap[aTask.tracker.uri].project.uri;
    };
    KGroupKeyIdentifiers[CbUtils.TGroupType.BySprint] = function(aAllMaps: CbUtils.TAllMaps, aTask: Cb.TTask) {
        var ret = KUnknownIdentifier;
        if (aTask._type == Cb.TItemType.Release) {
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
    KGroupConverters[CbUtils.TGroupType.ByUser] = function(aAllMaps: CbUtils.TAllMaps, aUserUri: string): DhxGantt.TTask {
        var user = aAllMaps.userMap[aUserUri];
        return {
            id: user.uri,
            text: getUserName(user),
            user: '-',
            type: gantt.config.types.project,
            _type: DhxGanttExt.TTaskType.User
        };
    };
    KGroupConverters[CbUtils.TGroupType.ByProject] = function(aAllMaps: CbUtils.TAllMaps, aProjectUri: string): DhxGantt.TTask {
        var project = aAllMaps.projectMap[aProjectUri];
        console.log(project);
        return {
            id: project.uri,
            text: project.name,
            user: '-',
            type: gantt.config.types.project,
            _type: DhxGanttExt.TTaskType.Project
        };
    };
    KGroupConverters[CbUtils.TGroupType.BySprint] = function(aAllMaps: CbUtils.TAllMaps, aReleaseUri: string, aParentId?: string): DhxGantt.TTask {
        var release: Cb.TRelease = aAllMaps.itemMap[aReleaseUri];
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

    function processGrouping(aAllMaps: CbUtils.TAllMaps, aTasks: Cb.TTask[], aGroupings: CbUtils.TGroupType[], aDepth: number, aParentId?: string): TGroupTask[] {
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
    KSorterByType[CbUtils.TSortingType.ByEndTime] = generatePropertySorter('endDate', true, dateStringCompare);
    KSorterByType[CbUtils.TSortingType.ByEndTimeDsc] = generatePropertySorter('endDate', false, dateStringCompare);
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
        aCb: (err, aDhxData: DhxGantt.TData, aDhxMarkerList: DhxGantt.TMarker[]) => void ) {

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
                filters.push(generatePropertyFilter(['status', 'name'], KCompletedStatusValues, false));
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

    export function roundDay(aDate: Date) {
        return new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
    }

    export function addDays(aDate: Date, aDays: number) {
        return new Date(aDate.getTime() + unitDay * aDays);
    }

    export function getPast7DateFromNow() {
        return addDays(roundDay(new Date()), -7);
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

}
