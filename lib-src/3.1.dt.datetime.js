//Time formats docs: http://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html
//Timezones docs: http://joda-time.sourceforge.net/timezones.html

function DateTool(options) {
    var t = this;
    t._options = {
        timezone: {offset: 0, name: 'GMT'},
        format: "yyyy-MM-dd"
    };
    Lib.util.extend(t._options, options);
    //this is a snapshort of the last settings before modification with options method
    //it i used to quiqly restore original settings, posted to DateManager
    t._checkpoint = Lib.util.extend({}, t._options);  //protect the checkpoint from modification
}

DateTool.prototype.options = function (options) {
    Lib.util.extend(this._options, options);
    return this;
};

DateTool.prototype.set = function (date, zeroTime) {
    this._date = this._parse(date, zeroTime);
    return this;
};

DateTool.prototype.resetOptions = function () {
    this._options = Lib.util.extend({}, this._checkpoint); //protect the checkpoint from modification
};

DateTool.isLeapYear = function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

DateTool.getDaysInMonth = function (year, month) {
    return [31, (DateTool.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

DateTool.prototype.isLeapYear = function () {
    return DateTool.isLeapYear(this._date.getFullYear());
};

DateTool.prototype.getDaysInMonth = function () {
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
    var n = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + deltaMonths);
    d.setDate(Math.min(n, t.getDaysInMonth()));
    return t;
};

/**
 * This function assumes your data objects is automatically created in local time zone
 *
 * @returns {*}
 * @param strOrDate
 * @param defaultTZ
 */
function getDate(strOrDate, defaultTZ) {
    var date;
    var offset = - parseInt(defaultTZ) * 60;  //default tz offset
    
    if (! strOrDate) strOrDate = new Date();

    if (typeof strOrDate === 'object') {
        date = strOrDate;
        if (date._convertedTZ) return date;
    } else if (typeof strOrDate === 'string') {
        var regexp = /^([0-9]{4})-([0-9]{2})-([0-9]{2})[T ]([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?(?:([+-])([0-9]{2}):([0-9]{2}))?.*/;
        var d = regexp.exec(strOrDate);

        date = new Date(parseInt(d[1]),
            parseInt(d[2]) - 1,
            parseInt(d[3]),
            parseInt(d[4]),
            parseInt(d[5]),
            parseInt(d[6]),
            0);

        //respect original timezone
        //we need to negate the sign to get the same literal date but in custom timezone
        if (d[7]) {
            offset = ((parseInt(d[8]) * 60) + parseInt(d[9])) *
                ((d[7] === '-') ? 1 : -1);
        }
    } else {
        throw Error("DateTool._parse: only date objects and strings are supported");
    }

    offset -= date.getTimezoneOffset();  //to make the created date to be UTC

    var time = date.getTime() + (offset * 60 * 1000);

    var newd = new Date(time);
    newd._convertedTZ = true;
    return newd;     
}


DateTool.prototype._parse = function (date, zeroTime) {
    var t = this;
    var d;

    d = getDate(date, t._options.timezone.offset);
    
    if (zeroTime) d.setHours(0, 0, 0, 0);
    
    return d;
};

DateTool.prototype.addDays = function (deltaDays) {
    var t = this;
    var d = new Date();
    d.setDate(t._date.getDate() + deltaDays);
    t._date = d;
    return t;
};

DateTool.prototype.print = function (format, timezone) {

    var t = this;

    return Utilities.formatDate(
        t._date,
        timezone || t._options.timezone.name,
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


Lib.dt.DateTool = DateTool;