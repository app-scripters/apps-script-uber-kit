function ColumnManager(sheet, rowWithNames) {
    this._sheet = sheet;
    this._rowWithNames = rowWithNames;
    this._names = this._mapNames(rowWithNames);
};

ColumnManager.prototype._mapNames = function () {
    var t = this,
        m = {};
    var names = getRangeValues(t._sheet, t._rowWithNames, 1, 1)[0];
    for (var i in names) {
        m[names[i]] = i + 1;
    }

    return m;
};

ColumnManager.prototype.getColumn = function (name) {
    var t = this;
    if (name[0] !== '*') {  //this is a column letter
        return Lib.util.letterToColumn(name);
    } else {
        return t._names[name];
    }
};

ColumnManager.prototype.refresh = function () {
    this._names = this._mapNames();
};

Lib.tool.ColumnManager = ColumnManager;

