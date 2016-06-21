/**
 * Manages column names
 * Zero-based indexes
 * @param row
 * @param namesArray
 * @constructor
 */
function RecordManager(namesArray) {
    this._namesArray = namesArray;
    this._namesToIndexes = this._mapNames();
}

RecordManager.prototype._mapNames = function () {
    var t = this,
        m = {};
    var names = t._namesArray;
    for (var i in t._namesArray) {
        m[String(names[i]).toLowerCase().trim()] = i;
    }

    return m;
};

RecordManager.prototype._prepareData = function(data){
    return (data && typeof data === "object") ? JSON.stringify(data) : data;
};

RecordManager.prototype._extractData = function(data){
    return (typeof data === "string" && data[0] in {'{':0 , '[':0}) ? JSON.parse(data) : data;
};


RecordManager.prototype.getFieldIndex = function (fieldName) {
    var t = this;
    return t._namesToIndexes[fieldName.toLowerCase().trim()] + 1;
};

RecordManager.prototype.getField = function (fieldName, row) {
    var t = this;
    return row[t.getFieldIndex(fieldName.toLowerCase().trim())];
};


RecordManager.prototype.toRecord = function (row) {
    var t = this;
    var record = {};
    
    for (var i in row){
        var name = t._namesArray[i];
        record[name] = t._extractData(row[i]);
    }
    
    return record;
};


RecordManager.prototype.toRow = function (record) {
    var t = this;
    var row = new Array(t._namesArray.length);
    
    for (var name in record){
        var i = t._namesToIndexes[name];
        row[i] = t._prepareData(record[name]);
    }
    return row;
};


Lib.tool.RecordManager = RecordManager;