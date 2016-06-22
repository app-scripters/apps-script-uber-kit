/**
 * 
 * @param ssPoolOrData - instance of SSPool 
 * @param options - Spreadsheet, parameters sheet etc.
 * @param isClientSide - if Configurator is running on HTML front-end (vs Apps Script back-end)
 * @constructor
 */
function Configurator(ssPoolOrData, options, isClientSide){
    var t = this;
    t._opt = options;
    if (typeof t._opt.doTrim === UNDEF){
        t._opt.doTrim = true;
    }
    t._doTrim = t._opt.doTrim;
    if (isClientSide){
        t._isClient = true;
        t._data = ssPoolOrData;
    }else {
        t._ssPool = ssPoolOrData;
    }
    t._params = null;
}

Configurator.prototype._handlers = {
    'string': function(val){return this._doTrim ? String(val).trim() : String(val);},
    'integer': function(val){return parseInt(val);},
    'float': function(val){return parseFloat(val);},
    'JSON': function(val){return JSON.parse(val.toString());},
    'date': function(val){return new Date(val);},
    'list': function(val, splitter){
        return this._doTrim ? 
            String(val).trim().split(Lib.util.makeRegex('\\s*', (splitter || ','), '\\s*')) :
            String(val).split(splitter || ',');
    },
    'array': function(val, terminator, row){
        const arr = row.slice(0, row.indexOf(terminator || ""));
        return this._doTrim ? arr.map(function(el){
                    return String(el).trim();
            }) : arr;
    },
    'map': function(val, terminator, row, nextRow){
        var row1 = row.slice(0, row.indexOf(terminator || ""));
        var row2 = nextRow.slice(0, row.indexOf(terminator || ""));

        var res = {};
        
        var i;
        if (this._opt.doTrim) {
            for (i = 0; i < row1.length; i++) {
                res[String(row1[i]).trim()] = String(row2[i]).trim();
            }
        }else{
            for (i = 0; i < row1.length; i++) {
                res[String(row1[i])] = String(row2[i]);
            }
        }
        return res;
    }
};


Configurator.prototype._getByType = function (row, value, atype, splitterOrTerminator, nextRow) {
    return this._handlers[atype].call(this, value, splitterOrTerminator, row, nextRow);
};

Configurator.prototype.get = function () {
    var t = this;
    if (t._params) {
        return t._params;
    } else {
        var res, values;
        if (t._isClient){
            values = t._data;
        }else{
            res = t._ssPool.get(t._opt.ADMIN_SPREADSHEET_ID, t._opt.PARAMETERS_SHEET_NAME);
            values = res.sheet.getDataRange().getValues();
        }
        t._params = {};
        var nextRowSlice = null;
        var ns = new Lib.util.Namespace(t._params);
        for (var i = t._opt.PARAM_ROWS_STARTS_FROM - 1; i < values.length; i++){
            var row = values[i];
            var namePath = row[t._opt.PARAM_NAME_POSITION - 1];
            if (namePath && ! /^\s*\/\//.test(namePath)) {   // '//' to comment'
                var atype = row[t._opt.PARAM_TYPE_POSITION - 1];
                if (atype === 'map'){
                    i++;
                    if (i < values.length){
                        nextRowSlice = values[i].slice(t._opt.PARAM_VALUE_POSITION - 1)
                    }else{
                        throw Error("Map '" + namePath + "': there are no second row")
                    }
                }else{
                    nextRowSlice = null;
                }
                ns.set(namePath,
                    t._getByType(
                        row.slice(t._opt.PARAM_VALUE_POSITION - 1),
                        row[t._opt.PARAM_VALUE_POSITION - 1],
                        atype,
                        row[t._opt.ITEMS_SPLITTER_POSITION - 1],
                        nextRowSlice
                    )
                );
            }
        }
        return t._params;
    }
};

Lib.tool.Configurator = Configurator;