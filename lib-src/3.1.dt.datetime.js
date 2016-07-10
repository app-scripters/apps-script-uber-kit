//Time formats docs: http://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html
//Timezones docs: http://joda-time.sourceforge.net/timezones.html

function DateTool(options) {
    var t = this;
    t._options = {
        timezone: 'GMT',
        format: "yyyy-MM-dd"
    };

    t.options(options);
    
    //this is a snapshort of the last settings before modification with options method
    //it i used to quiqly restore original settings, posted to DateManager
    t._checkpoint = Lib.util.extend({}, t._options);  //protect the checkpoint from modification
}

DateTool.prototype._recalculate = function () {
    this._tzOffset = - 60 * Number(
        //a hack to determine proper offset from the tz name
        Utilities.formatDate(new Date(), this._options.timezone, "X")
    );
};

DateTool.prototype.options = function (options) {
    Lib.util.extend(this._options, options);
    this._recalculate();
    return this;
};

DateTool.prototype.set = function (date, zeroTime) {
    this._date = this._parse(date, zeroTime);
    return this;
};

DateTool.prototype.resetOptions = function () {
    this._options = Lib.util.extend({}, this._checkpoint); //protect the checkpoint from modification
    this._recalculate();
    return this;
};

DateTool.isLeapYear = function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

DateTool.getDaysInMonth = function (year, month) {
    return [31, (DateTool.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

DateTool.prototype.isLeapYear = function () {
    if (! this._date) return null;
    return DateTool.isLeapYear(this._date.getFullYear());
};

DateTool.prototype.getDaysInMonth = function () {
    if (! this._date) return null;
    return DateTool.getDaysInMonth(this._date.getFullYear(), this._date.getMonth());
};

DateTool._adders = {
    month: function (delta) {this.addMonths(delta)},
    day: function (delta) {this.addDays(delta)},
    week: function (delta) {this.addDays(delta*7)},
};

DateTool.prototype.add = function (what, delta) {
    DateTool._adders[what].call(this, delta);
    return this;
};

DateTool.prototype.addMonths = function (deltaMonths) {
    var t = this;
    var d = t._date;
    if (! d) return t;
    var n = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + deltaMonths);
    d.setDate(Math.min(n, t.getDaysInMonth()));
    return t;
};

/**
 * Converts a string to Date, respects timezone if present on the string,
 * if not - treats the date to be in the defaultTZOffset timezone (ex: 2015-06-09)
 * @param string
 * @param defaultTZOffset
 * @returns {*}
 */
function getDateFromIso(string, defaultTZOffset) {
    try {
        var aDate = new Date();
        var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
            "((?:T| )([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
            "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
        var d = string.match(new RegExp(regexp));

        var offset = 0;
        var date = new Date(d[1], 0, 1);

        if (d[3]) {
            date.setMonth(d[3] - 1);
        }
        if (d[5]) {
            date.setDate(d[5]);
        }
        if (d[7]) {
            date.setHours(d[7]);
        }
        if (d[8]) {
            date.setMinutes(d[8]);
        }
        if (d[10]) {
            date.setSeconds(d[10]);
        }
        if (d[12]) {
            date.setMilliseconds(Number("0." + d[12]) * 1000);
        }
        
        if (d[14]) {
            offset = (Number(d[16]) * 60) + Number(d[17]);
            offset *= ((d[15] == '-') ? 1 : -1);
        }else{
            offset = defaultTZOffset
        }
        
        if (isNaN( date.getTime() )) {
            //this is some very terrible bug in the Apps Script
            Logger.log("Invalid date: " + JSON.stringify(d));
            return null;
        }
        
        offset -= date.getTimezoneOffset();
        var time = (Number(date) + (offset * 60 * 1000));
        aDate.setTime(Number(time));
        return aDate;
    } catch (e) {
        Logger.log(e);
        throw Error("getDateFromISO: " + e.message);
    }
}

/**
 * Converts strings to dates, creates new Date() for empty, 
 * idempotent for Date objects
 *
 * @returns {*}
 * @param date
 * @param targetTZOffset
 */
function getDate(date, targetTZOffset) {
    if (! date) return new Date(); //now time, no timezone needed

    if (typeof date === 'object') {
        return date;
    } else if (typeof date === 'string') {
        return getDateFromIso(date, targetTZOffset)
    } else {
        throw Error("DateTool._parse: only date objects and strings are supported");
    }
}


DateTool.prototype._parse = function (date, zeroTime) {
    var t = this;
    var d;

    d = getDate(date, t._tzOffset);
    
    if (d && zeroTime) d.setHours(0, 0, 0, 0);
    
    return d;
};

DateTool.prototype.addDays = function (deltaDays) {
    var t = this;
    if (! t._date) return t;
    var d = new Date();
    d.setDate(t._date.getDate() + deltaDays);
    t._date = d;
    return t;
};

DateTool.prototype.print = function (format, timezone) {

    var t = this;
    if (! t._date) return 'INVALID';

    return Utilities.formatDate(
        t._date,
        timezone || t._options.timezone,
        format || t._options.format)
};


DateTool.prototype.delta = function (start, end, what) {
    var t = this;
    var delta = {}, measurements = {
        week: 604800000,
        day: 86400000,
        hour: 3600000,
        minute: 60000,
        second: 1000
    };

    start = t._parse(start);
    end =  t._parse(end);

    var ms = Math.abs(end.getTime() - start.getTime());

    return Math.floor(ms / measurements[what]);
};


DateTool.prototype.format = {
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
};

Lib.dt.DateTool = DateTool;