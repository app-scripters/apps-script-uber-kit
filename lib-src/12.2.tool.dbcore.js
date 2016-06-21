function DBCore(sheet, headerRowPosition, startColumn, width) {
    var t = this;
    t._sheet = sheet;
    t._startColumn = startColumn || 1;
    t._width = width || null;
    t._headerRowPos = headerRowPosition;
    t._header = Lib.util.getRange(
        t._sheet,
        [t._headerRowPos, t._startColumn], [1, t._width]
    ).getValues()[0];
    
    t._initActualRange();
}


DBCore.prototype.getBaseRow = function () {
    return this._headerRowPos + 1;
};


DBCore.prototype._initActualRange = function () {
    var t = this;
    t._range = Lib.util.getRange(
        t._sheet,
        [t._headerRowPos + 1, t._startColumn], [null, t._width]
    );
    t._height = t._range.getHeight();
    t._width = t._range.getWidth(); //actual width if not specified
};


DBCore.prototype._checkConstraints = function (data) {
    var t = this;
    if (data[0].length !== t._width) throw Error("Data width != range width");
};


DBCore.prototype._subset = function (startOffset, rowNumber) {
    var t = this;
    if (!startOffset && !rowNumber) return t._range; //optimization
    return t._range.offset(startOffset || 0, 0, rowNumber || t._height, t._width);
};


DBCore.prototype.getRows = function (optStartRow, optRowsNumber) {
    var t = this;
    var res = t._range.getValues();
    if (optStartRow || optRowsNumber){
        optStartIndex = (optStartRow || 1) - 1;
        optRowsNumber = optRowsNumber || t._height;
        res = res.slice(optStartIndex, optStartIndex + optRowsNumber);
    }
    return res;
};


DBCore.prototype.getHeader = function () {
    return this._header;
};


DBCore.prototype.updateRows = function (startOffset, data) {
    var t = this;
    t._checkConstraints(data);
    t._subset(startOffset, data.length).setValues(data);
    return true;
};
/**
 * Rewrites existing data with new
 * @param data
 * @returns {boolean}
 */
DBCore.prototype.rewriteAll = function (data) {
    var t = this;
    t._checkConstraints(data);
    t._range.clearContent();
    return t._appendRows(data);
};

/**
 * Appends to existing records
 * @param data
 * @returns {boolean}
 */
DBCore.prototype.appendRows = function (data) {
    var t = this;
    t._checkConstraints(data);
    return t._appendRows(data);
};


DBCore.prototype._appendRows = function (data) {
    var t = this;
    var res = Lib.util.writeRows(t._sheet, data, t._startColumn);
    if (res.inserted){
        //need to update original range, because new column where inserted at the bottom
        t._initActualRange();
    } 
    //SpreadsheetApp.flush();
    return true
};

/**
 *
 * @param criteria - {index: value, index2: value2...}
 * @param startOffset
 * @param limit
 */
/*DBManager.prototype.selectRows = function (criteria, startOffset, limit) {
    var t = this,
        rows = [],
        matches = 0;
        
    limit = limit || 1e+20;
    startOffset = startOffset || 0;
    
    var values = t._range.getValues();
    var criteriaNumber = Object.keys(criteria).length;
    
    for (var i = 0; i < values.length; i++) {
        if (criteriaNumber) {
            var matched = true;
            for (var c in criteria) {
                if (values[i][c].toString().indexOf(criteria[c]) === -1) {
                    matched = false;
                    break;
                }
            }
            if (! matched) continue;
        }
        matches++;
        if (matches >= startOffset) {
            rows.push(values[i]);
            if (rows.length >= limit) break;
        }
    }
    return rows;
}*/

Lib.tool.DBCore = DBCore;