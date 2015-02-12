/// <reference path="../typings/tsd.d.ts"/>
var CalendarUtils;
(function (CalendarUtils) {
    function get(aUrl, aCb) {
        console.info('GET: ' + aUrl);
        var options = {};
        options.url = aUrl;
        var promise = Http['get'](options);
        promise.then(function (resp) {
            aCb(null, resp.body);
        });
        promise.catch(function (err) {
            aCb(err);
        });
    }
    //    var url = 'https://www.google.com/calendar/feeds/ko.south_korea%23holiday%40group.v.calendar.google.com/public/full-noattendees'
    var url = 'http://www.google.com/calendar/feeds/ko.south_korea%23holiday%40group.v.calendar.google.com/public/basic';
    var calEntries = window['gCalData'] || [];
    var workingHours = gConfig.workingHours;
    var unitDay = 1000 * 60 * 60 * 24;
    var unitHour = 1000 * 60 * 60;
    var weekends = [0, 6];
    var isHolidayCache = {};
    function roundDay(aDate) {
        return new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
    }
    function addDays(aDate, aDays) {
        return new Date(aDate.getTime() + unitDay * aDays);
    }
    function isWeekends(aDate) {
        return weekends.indexOf(aDate.getDay()) !== -1;
    }
    if (calEntries.length) {
        //        var s_10_02 = new Date(2014, 9, 8);
        //        getStartAndEndDate(s_10_02, workingHours * unitHour * 2);
        //        getStartAndEndDate(s_10_02, workingHours * unitHour * 3);
        var s_09_05 = new Date(2014, 8, 6);
        getStartAndEndDate(s_09_05, workingHours * unitHour * 2);
        calEntries.forEach(function (e) {
            var start = roundDay(e.start);
            var end = roundDay(e.end);
            while (start < end) {
                isHolidayCache[start.getTime()] = e;
                start = addDays(start, 1);
            }
        });
    }
    else {
        get(url, function (err, resp) {
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
    function getStartAndEndDate(aStartTime, aDuration) {
        var hours = Math.ceil(aDuration / unitHour);
        var days = Math.ceil(hours / workingHours);
        var start = new Date(aStartTime.getFullYear(), aStartTime.getMonth(), aStartTime.getDate());
        var end = addDays(start, days);
        //        console.log('getEndDate From: ' + start + ' ~ ' + end + ' (' + days + ')');
        var holidays = calEntries.slice(0);
        var holiday = holidays.shift();
        while (holiday && holiday.end < start) {
            holiday = holidays.shift();
        }
        while (1) {
            if (holiday.start <= start) {
                start = new Date(holiday.end.getTime());
                //                console.log('start holiday add');
                holiday = holidays.shift();
                continue;
            }
            if (isWeekends(start)) {
                //                console.log('start weekend add');
                start = addDays(start, 1);
                continue;
            }
            break;
        }
        end = new Date(start.getTime());
        while (1) {
            if (holiday.start <= end) {
                //                console.log('end holiday add');
                end = new Date(holiday.end.getTime());
                holiday = holidays.shift();
                continue;
            }
            if (isWeekends(end)) {
                //                console.log('end weekend add');
                end = addDays(end, 1);
                continue;
            }
            if (days) {
                //                console.log('end duration add');
                end = addDays(end, 1);
                days = days - 1;
                if (days) {
                    continue;
                }
            }
            break;
        }
        //        console.log('getEndDate To  : ' + start + ' ~ ' + end);
        return {
            start: start,
            end: end
        };
    }
    CalendarUtils.getStartAndEndDate = getStartAndEndDate;
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
    CalendarUtils.getEndDate = getEndDate;
    function isHoliday(aDate) {
        var date = roundDay(aDate);
        var dateKey = date.getTime();
        if (isHolidayCache[dateKey]) {
            return isHolidayCache[dateKey];
        }
        return null;
    }
    CalendarUtils.isHoliday = isHoliday;
})(CalendarUtils || (CalendarUtils = {}));
//# sourceMappingURL=Calendar.js.map