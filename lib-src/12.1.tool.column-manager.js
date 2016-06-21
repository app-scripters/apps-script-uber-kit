function ColumnManager(sheet, rowWithNames) {
    this._sheet = sheet;
    this._rowWithNames = rowWithNames;
    this._namesMap = this._mapNames(rowWithNames);
}

ColumnManager.prototype._mapNames = function () {
    var t = this,
        m = {};
    var names = Lib.util.getRangeValues(t._sheet, [t._rowWithNames, 1], [1, null])[0];
    for (var i in names) {
        m[names[i]] = i + 1;
    }

    return m;
};

ColumnManager.prototype.getColumn = function (name) {
    return this._namesMap[name] || null;
};

ColumnManager.prototype.refresh = function () {
    this._namesMap = this._mapNames();
};

Lib.tool.ColumnManager = ColumnManager;

