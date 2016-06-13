function ParamsDict(fields) {
    var t = this;
    t.fields = fields;
}
ParamsDict.prototype._getField = function(fieldName, fieldBody, values, offsets){
    var t = this;
    var spec = fieldBody.split(/\s*;\s*/);

    var row = parseInt(spec[0]) - 1 + offsets.row;
    var col = parseInt(spec[1]) - 1 + offsets.col;
    
    if (spec.length > 2){
        var dict = {};
        for(var j=2; j<spec.length; j++){
            if(spec[j]) {  //you can skip a column by giving empty name: 1;2;desc;;;val <-- [desc, '', '', val] 
                dict[spec[j]] = values[row][col + j - 2];
            }
        }
        return dict;
    }else{
        return values[row][col];
    }
};

ParamsDict.prototype.get = function (values, offsets) {
    var t = this;
    offsets = offsets || {row: 0, col:0};
    
    var data = {};
    for (var fieldName in t.fields) {
        var val = t.fields[fieldName];
        if (Lib.util.isArray(val)){
            var results = [];
            for (var i=0; i<val.length; i++) {
                results.push(t._getField(fieldName, val[i], values, offsets));
            }
            data[fieldName] = results;
        }else{
            data[fieldName] = t._getField(fieldName, val, values, offsets);
        }
    }
    return data;
};


Lib.tool.ParamsDict = ParamsDict;