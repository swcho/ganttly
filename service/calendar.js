/// <reference path="../typings/tsd.d.ts"/>

angular.module('ganttly').factory('$calendar', function ($http) {
    var url = 'https://www.google.com/calendar/feeds/ko.south_korea%23holiday%40group.v.calendar.google.com/public/full-noattendees';
    var calEntries = window['gCalData'] || [];
    var workingHours = gConfig.workingHours;
    var unitDay = 1000 * 60 * 60 * 24;
    var unitHour = 1000 * 60 * 60;
    var weekends = [0, 6];

    function roundDay(aDate) {
        return new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
    }

    function addDays(aDate, aDays) {
        return new Date(aDate.getTime() + unitDay * aDays);
    }

    function isWeekends(aDate) {
        return weekends.indexOf(aDate.getDay()) !== -1;
    }

    var isHolidayCache = {};
    function isHoliday(aDate) {
        var date = new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
        var dateKey = date.toString();
        var ret = null;
        if (isHolidayCache[dateKey]) {
            return isHolidayCache[dateKey];
        } else {
            var i, len = calEntries.length, entry;
            for (i = 0; i < len; i++) {
                entry = calEntries[i];
                if (entry.start <= date && date < entry.end) {
                    console.log(entry);
                    ret = entry;
                    break;
                }
            }
            isHolidayCache[dateKey] = ret;
        }
        return ret;
    }

    function getEndDate(aStartTime, aDuration) {
        var hours = Math.ceil(aDuration / unitHour);
        var days = Math.ceil(hours / workingHours);
        var start = new Date(aStartTime.getFullYear(), aStartTime.getMonth(), aStartTime.getDate());
        var end = addDays(start, days);
        console.log('getEndDate From: ' + start + ' ~ ' + end + ' (' + days + ')');
        var i, len = calEntries.length, entry;
        var appliedHolidays = [];
        for (i = 0; i < len; i++) {
            entry = calEntries[i];
            if (start <= entry.start && entry.start < end) {
                console.log(entry);
                end = new Date(end.getTime() + entry.end.getTime() - entry.start.getTime());
                appliedHolidays.push(entry);
            }
        }
        var day = new Date(start.getTime());
        var appliedHoliday = appliedHolidays.shift();
        for (; day < end;) {
            console.log(day.getDay() + ': ' + day);
            if (appliedHoliday && appliedHoliday.start === day) {
                day = new Date(appliedHoliday.end);
                continue;
            }
            if (isWeekends(day)) {
                end = addDays(end, 1);
            }
            day = addDays(day, 1);
        }
        console.log('getEndDate To  : ' + start + ' ~ ' + end);
        return end;
    }

    if (calEntries.length) {
        //        var s_10_02 = new Date(2014, 9, 8);
        //        getEndDate(s_10_02, workingHour * unitHour * 2);
        //        getEndDate(s_10_02, workingHour * unitHour * 3);
        //        var s_09_05 = new Date(2014, 8, 5);
        //        getEndDate(s_09_05, workingHour * unitHour * 2);
        var s_09_08 = new Date(2014, 8, 8);
        isHoliday(s_09_08);
    } else {
        $http.get(url).success(function (resp) {
            var json = $.xml2json(resp);
            if (json.feed.entry) {
                json.feed.entry.forEach(function (entry) {
                    calEntries.push({
                        title: entry.title['_'],
                        start: roundDay(new Date(entry['gd:when']['$']['startTime'])),
                        end: roundDay(new Date(entry['gd:when']['$']['endTime']))
                    });
                });
                calEntries.sort(function (e1, e2) {
                    return e1.start.getTime() - e2.start.getTime();
                });
            }
        });
    }

    return {
        getEndDate: function (aStartTime, aDuration) {
            return getEndDate(aStartTime, aDuration);
        },
        isHoliday: function (aDate) {
            return isHoliday(aDate);
        }
    };
});
//# sourceMappingURL=calendar.js.map
