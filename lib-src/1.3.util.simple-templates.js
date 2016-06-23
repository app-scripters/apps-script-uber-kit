//very simple templating
/**
 * 
 * @param s - template string with {{ var }} variable inclusions
 * @param argsDict - context object or array ob context objects
 * @param overrideDicts - for array of contexts case: process all contexts and override, or stop on first matching context var
 * @returns {void|XML|string|*}
 */
Lib.util.bindTemplate = function(s, argsDict){
    if (Array.isArray(argsDict)){
        argsDict = Lib.util.unite({}, argsDict);
    }

    var ns = new Lib.util.Namespace(argsDict);

    return s.replace(/{{\s*(\w+)\s*}}/g, _makeCapturer(argsDict, ns));
};

function _makeCapturer(argsDict, ns){
    return function(capture, p1){
        if (p1.indexOf('.') === -1){
            return argsDict[p1] || '';
        }else {
            const res = ns.get(p1);
            return res === null ? '' : res.value;
        }
    }  
}
