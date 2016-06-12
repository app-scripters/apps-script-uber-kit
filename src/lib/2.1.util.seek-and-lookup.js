Lib.util.seekColumn = function(pattern, columnIndex0, rangeValues, searchAll){
    var results = [];
    if (pattern) {
        var colNum = rangeValues[0].length;
        var rowNum = rangeValues.length;
        var re = new RegExp(Lib.util.escapeRegExp(pattern.toString().trim()), 'i');
        for (var rowi = 0; rowi < rowNum; rowi++) {
            if (rangeValues[rowi][columnIndex0].toString().search(re) !== -1) {
                if (! searchAll){
                    return rowi;
                }else{
                    results.push(rangeValues[rowi]);
                }
            }
        }
    }
    return results.length > 0 ? results : -1;
};

Lib.util.lookup = function(pattern, rangeValuesForSearch, searchAll){
    var results = [];
    if (pattern) {
        var colNum = rangeValuesForSearch[0].length;
        var rowNum = rangeValuesForSearch.length;
        var re = new RegExp(Lib.util.escapeRegExp(pattern.toString().trim()), 'i')
        for (var coli = 0; coli < colNum; coli++) {
            for (var rowi = 0; rowi < rowNum; rowi++) {
                if (rangeValuesForSearch[rowi][coli].toString().search(re) !== -1) {
                    if (! searchAll){
                        return rowi;
                    }else{
                        results.push(rowi);
                    }
                }
            }
        }
    }
    return results.length > 0 ? results : -1;
};

Lib.util.multiLookup._getColumn = function(letter){
    return this.record[Lib.util.letterToColumn(letter)];
};

Lib.util.multiLookup = function(patterns, columnsForPatternsToSearchOver, wholeDataRangeValues, searchAll){
    var results = [];
    var patternsMatchNumbers = {};
    
    var rowNum = wholeDataRangeValues.length;
    
    if (patterns) {
        var patternsNumber = patterns.length;
        
        for (var p = 0; p < patternsNumber; p++) {
            
            //take a particular range to search for a particular pattern
            //search wil be done in ALL columns for this particular pattern
            //typically, you'll want only one-column ranges for one pattern
            
            var columnForSearchIndex = Lib.util.letterToColumn(columnsForPatternsToSearchOver[p]); 
            
            var re = new RegExp(Lib.util.escapeRegExp(patterns[p].toString().trim()), 'i');
            
            for (var rowi = 0; rowi < rowNum; rowi++) {
                if (wholeDataRangeValues[rowi][columnForSearchIndex].toString().search(re) !== -1) {
                    if (patternsMatchNumbers[rowi] &&                 //we already found some of patterns on this row 
                        (patternsMatchNumbers[rowi] + 1) === patternsNumber //so we have found already all patterns on this row including this one
                    ){
                        if (!searchAll) {
                            return { index: rowi, record: wholeDataRangeValues[rowi], get: Lib.util.multiLookup._getColumn};
                        } else {
                            results.push({ index: rowi, record: wholeDataRangeValues[rowi], get: Lib.util.multiLookup._getColumn});
                        }
                    } else {
                        //either no or not all patterns found on this row
                        patternsMatchNumbers[rowi] = (patternsMatchNumbers[rowi] || 0 /*"undefined" handling*/) + 1;
                    }
                }
            }
        }
    }
    return results.length > 0 ? results : -1;
};

