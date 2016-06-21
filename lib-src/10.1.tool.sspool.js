function SSPool() {
    var t = this;
    t.error = null;
    t._ssSet = {};
}

SSPool.prototype.get = function (ssId, sheetName) {
    return this._get(ssId, sheetName, false, false);
};

SSPool.prototype.getMayCreate = function (ssId, sheetName) {
    return this._get(ssId, sheetName, true, false);
};

SSPool.prototype.getWithRange = function (ssId, sheetName, rangeSpec) {
    //TODO
    //return this._get(ssId, sheetName, createSheetIfMissing, rangeName);
};

SSPool.prototype._get = function (ssId, sheetName, createSheetIfMissing, rangeName /*TODO*/) {
    var t = this;
    t.error = null;
    var ss;
    if (! (ssId in t._ssSet)){
        if (ssId === '' || ssId === 'this'){
            ss = SpreadsheetApp.getActiveSpreadsheet();
            ssId = ss.getId();
        }else {
            ss = SpreadsheetApp.openById(ssId);
        }
        if (! ss) {
            t.error = "Wrong Spreadsheet ID: " + ssId + ", use '' to get active SS";
            return null;
        }
        
        t._ssSet[ssId] = {
            ss: ss,
            sheets: {},  //move ranges here: {"asheet": {sheet: obj, ranges: {}}
            ranges: {},  //should be per-sheet
            sheet: null, //last fetched sheet
            range: null  //last fetched range
        };
    }else{
        ss = t._ssSet[ssId].ss;
    }
    if (sheetName) {
        var sheet = t._ssSet[ssId].sheets[sheetName];
        if (! sheet){
            sheet = ss.getSheetByName(sheetName);
            if (! sheet){
                if(createSheetIfMissing){
                    sheet = ss.insertSheet(sheetName, 0);
                }else {
                    t.error = "Wrong sheet name: " + sheetName;
                    return null;
                }
            }
            t._ssSet[ssId].sheets[sheetName] = sheet;
        }
        t._ssSet[ssId].sheet = sheet;
    } else if (sheetName === ''){ //shortcut for the active sheet
        var _sheet = t._ssSet[ssId].sheet = ss.getActiveSheet();
        t._ssSet[ssId].sheets[_sheet.getName()] = _sheet;
    }
    return t._ssSet[ssId];
};

Lib.tool.SSPool = SSPool;

globalService.ssPool = new SSPool();

