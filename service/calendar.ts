
/// <reference path="../typings/tsd.d.ts"/>

declare module cal {
    interface TCalEntry {
        title: string;
        start: Date;
        end: Date;
    }
}

declare var gConfig;

angular.module('ganttly').factory('$calendar',function($http) {

    var url = 'https://www.google.com/calendar/feeds/ko.south_korea%23holiday%40group.v.calendar.google.com/public/full-noattendees'
    var calEntries: cal.TCalEntry[] = window['gCalData'] || [];
    var workingHour = gConfig.workingHour;
    var unitDay = 1000 * 60 * 60 * 24;
    var unitHour = 1000 * 60 * 60;
    var weekends = [0, 6];

    function roundDay(aDate: Date) {
        return new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
    }

    function addDays(aDate: Date, aDays: number) {
        return new Date(aDate.getTime() + unitDay * aDays);
    }

    function isWeekends(aDate: Date) {
        return weekends.indexOf(aDate.getDay()) !== -1;
    }

    function isHoliday(aDate: Date) {
        var date = new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
        var i, len=calEntries.length, entry;
        for (i=0; i<len; i++) {
            entry = calEntries[i];
            if (entry.start <= date && date < entry.end) {
                console.log(entry);
                return entry;
            }
        }
        return null;
    }

    function getEndDate(aStartTime: Date, aDuration: number) {
        var hours = Math.ceil(aDuration / unitHour);
        var days = Math.ceil(hours / workingHour);
        var start = new Date(aStartTime.getFullYear(), aStartTime.getMonth(), aStartTime.getDate());
        var end = addDays(start, days);
        console.log('getEndDate From: ' + start + ' ~ ' + end + ' (' + days + ')');
        var i, len=calEntries.length, entry;
        var appliedHolidays = [];
        for (i=0; i<len; i++) {
            entry = calEntries[i];
            if (start <= entry.start && entry.start < end) {
                console.log(entry);
                end = new Date(end.getTime() + entry.end.getTime() - entry.start.getTime());
                appliedHolidays.push(entry);
            }
        }
        var day = new Date(start.getTime());
        var appliedHoliday = appliedHolidays.shift();
        for (; day<end; ) {
            console.log(day.getDay() + ': ' + day);
            if (appliedHoliday && appliedHoliday.start == day) {
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
        $http.get(url).success(function(resp) {
            var resp = (<any>$).xml2json(resp);
            if (resp.feed.entry) {
                resp.feed.entry.forEach(function(entry) {
                    calEntries.push({
                        title: entry.title['_'],
                        start: roundDay(new Date(entry['gd:when']['$']['startTime'])),
                        end: roundDay(new Date(entry['gd:when']['$']['endTime']))
                    });
                });
                calEntries.sort(function(e1, e2) {
                    return e1.start.getTime() - e2.start.getTime();
                });
            }
        });
    }

    return {
        getEndDate: function(aStartTime: Date, aDuration: number) {
        }
    };

});
