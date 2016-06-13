function Configurator(ssPoolOrData, options, isClientSide){
    var t = this;
    t._opt = options;
    if (isClientSide){
        t._isClient = true;
        t._data = ssPoolOrData;
    }else {
        t._ssPool = ssPoolOrData;
    }
    t._params = null;

    t._handlers = {
        'string': function(val){return val.toString();},
        'integer': function(val){return parseInt(val);},
        'float': function(val){return parseFloat(val);},
        'JSON': function(val){return JSON.parse(val.toString());},
        'date': function(val){return new Date(val);},
        'list': function(val, splitter){
            return val.toString()
                .split(Lib.util.makeRegex('\\s*', splitter, '\\s*'));
        },
        'array': function(val, terminator, row){
            return row.slice(0, row.indexOf(terminator || ""));
        }
    }
    
}

Configurator.prototype._getByType = function (row, value, atype, splitterOrTerminator) {
    return this._handlers[atype](value, splitterOrTerminator, row);
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
        var params = {};
        for (var i = t._opt.PARAM_ROWS_STARTS_FROM - 1; i < values.length; i++){
            var row = values[i];
            var name = row[t._opt.PARAM_NAME_POSITION - 1];
            if (name && ! /^\s*\/\//.test(name)) {   // '//' to comment'
                Lib.util.walkNamespace(params, name,
                    t._getByType(
                        row.slice(t._opt.PARAM_VALUE_POSITION - 1),
                        row[t._opt.PARAM_VALUE_POSITION - 1],
                        row[t._opt.PARAM_TYPE_POSITION - 1],
                        row[t._opt.ITEMS_SPLITTER_POSITION - 1]
                    )
                );
            }
        }
        t._params = params;
        
        return t._params;
    }
};

Lib.tool.Configurator = Configurator;