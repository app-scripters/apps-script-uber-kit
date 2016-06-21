//very simple templating
/**
 * 
 * @param s - template string with {{ var }} variable inclusions
 * @param argsDict - context object or array ob context objects
 * @param overrideDicts - for array of contexts case: process all contexts and override, or stop on first matching context var
 * @returns {void|XML|string|*}
 */
Lib.util.bindTemplate = function(s, argsDict, overrideDicts){
    var capturer = Lib.util.isArray(argsDict) ? 
        Lib.util.bindTemplate._arrayCtxCapture(argsDict, overrideDicts) : 
        Lib.util.bindTemplate._simpleCapture(argsDict);
    
    return s.replace(/{{\s*\w+\s*}}/ig, capturer);
};

Lib.util.bindTemplate._simpleCapture = function(argsDict){
    return function(capture){
        return argsDict[capture.match(/\w+/i)]
    }  
};


Lib.util.bindTemplate._arrayCtxCapture = function(arrayOfArgsDict, overrideDicts){
    return function(capture){
        var result = '';
        var key = capture.match(/\w+/i); 
        for (var i = 0; i < arrayOfArgsDict.length; i++) {
            var dict = arrayOfArgsDict[i];
            if (key in dict){
                result = dict[key];
                if (! overrideDicts) break;
            }
        }
        return result;
    }  
};
