function SSPool() {
    var t = this;
    t.error = null;
    t._ssSet = {};
}

SSPool.prototype.get = function (ssId, sheetName, createSheetIfMissing) {
    return this._get(ssId, sheetName, createSheetIfMissing, false);
};

SSPool.prototype.getWithRange = function (ssId, rangeSpec, createSheetIfMissing) {
    //TODO
    //return this._get(ssId, sheetName, createSheetIfMissing, rangeName);
};

SSPool.prototype._get = function (ssId, sheetName, createSheetIfMissing, rangeName /*TODO*/) {
    var t = this;
    t.error = null;
    var ss;
    if (! (ssId in t._ssSet)){
        if (ssId === ''){
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
            sheets: {},
            ranges: {},
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
        t._ssSet[ssId].sheet = ss.getActiveSheet();
    }
    return t._ssSet[ssId];
};

Lib.tool.SSPool = SSPool;

service.ssPool = new SSPool();

