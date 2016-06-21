Lib.util.stub = function () {
    return null;
};

Lib.util.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

Lib.util.isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

Lib.util.isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
};

Lib.util.escapeRegExp = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

Lib.util.makeRegex = function (pre, text, post) {
    return new RegExp(pre + escapeRegExp(text) + post);
};

Lib.util.makeUrlParams = function (obj) {
    if (! obj) return '';
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    return str.length ? ('?' + str.join("&")) : '';
};

Lib.util.log = function (msg, data) {
    if (data) {
        Logger.log("\n\n" + msg + " ===> " + JSON.stringify(data) + "\n\n");
    } else {
        Logger.log("\n\n" + msg + "\n\n");
    }
};

Lib.util.trace = function (err) {
    var errInfo = "\n";
    for (var prop in err) {
        errInfo += prop + ": " + err[prop] + "\n";
    }
    return errInfo;
};

/**
 * Extends or overwrites
 * @returns {*|{}}
 */
Lib.util.extend = function () {
    var destination = arguments[0] || {};
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        if (source) {
            for (var property in source) {
                if (source.hasOwnProperty(property)) {
                    destination[property] = source[property];
                }
            }
        }
    }
    return destination;
};


Lib.util.columnToLetter = function (column) {
    if (typeof column === "string") return column;

    var temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
};


Lib.util.letterToColumn = function (letter) {
    var num = parseInt(letter);
    if (!isNaN(num)) return num;

    var column = 0, length = letter.length;
    for (var i = 0; i < length; i++) {
        column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
};

Lib.util.getRange = function(sheet, startRC, howManyRC) {
    var row_num = sheet.getLastRow() - startRC[0] + 1;
    var column_num = sheet.getLastColumn() - startRC[1] + 1;
    if (row_num < 1) return [];
    if (column_num < 1) return [];
    return sheet.getRange(startRC[0], startRC[1],
        howManyRC[0] !== null ? howManyRC[0] : row_num,
        howManyRC[0] !== null ? howManyRC[0] : column_num
    );
};


Lib.util.appendCell = function(sheet, data, start_c) {
    var max_rows = sheet.getMaxRows();
    var last_row = sheet.getLastRow();
    if (max_rows - last_row === 0) {
        sheet.insertRowsAfter(max_rows, 1)
    }
    var range = sheet.getRange(last_row + 1, start_c || 1, 1, 1); //data should be normalized - all columns with the same size
    range.setValue(data);
};


Lib.util.writeRows = function(sheet, data, optStartColumn, columnNameToScanForEndORLastRow, numberOfRowsToExtend) {
    var o = {};
    var max_rows = sheet.getMaxRows();
    var last_row = 1;
    if (columnNameToScanForEndORLastRow != null) { //null or undefined
        if (typeof columnNameToScanForEndORLastRow === 'string') { //column name
            var values = sheet.getRange(columnNameToScanForEndORLastRow + '1:' + columnNameToScanForEndORLastRow).getValues();
            for (var r = values.length - 1; r >= 0; r--) {
                if (values[r][0]) {
                    last_row = r + 1;
                    break;
                }
            }
        } else { //should be a number
            last_row = columnNameToScanForEndORLastRow;
        }
    } else {
        last_row = sheet.getLastRow();
    }

    var l = data.length;

    if (max_rows - last_row < l) {
        sheet.insertRowsAfter(max_rows, l - (max_rows - last_row) + (numberOfRowsToExtend || 1));
        o.inserted = true;
    }

    var range = sheet.getRange(last_row + 1, optStartColumn || 1, data.length, data[0].length); //data should be normalized - all columns with the same size
    range.setValues(data);

    return o;
};


Lib.util.getColumn = function (values, numberOrLetter, from) {
    var index = Lib.util.letterToColumn(numberOrLetter) - 1;
    var res = [];
    for (var i = (from || 0); i < values.length; i++) {
        res.push(values[i][index]);
    }
    return res;
};

//====================================================================================================================================================
