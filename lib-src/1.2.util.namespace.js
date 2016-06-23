/**
 * Finds (and optionally creates) proper sub-object in the namespace base object by string path
 * @param  {Object} baseNS         Base object
 * @param  {string} namePathString like "A.B.C"m where C is a target name for value placing
 * @param {string} optValue   --- value to write, if it is specified, this is a write operation
 */

function Namespace(ns) {
    var t = this;
    t._ns = ns;
    t._lastNamePrefix = null;
}

/**
 * Gets the descriptor with value and scope, or returns null if not found
 * @param path
 * @param name
 * @returns {{value, scope}|{scope}|null}
 */
Namespace.prototype.get = function (path, name) {
    if (typeof name !== "undefined"){
        path = path + "." + name;
    }
    return this._walkNamespace(path, "get");
};

Namespace.prototype.set = function (path, value) {
    return this._walkNamespace(path, "set", value);
};

/**
 * builds or gets the scope by path
 * scopeObject - empty array or object
 */
Namespace.prototype.buildScope = function (path, scopeObject) {
    return this._walkNamespace(path, "build", scopeObject).scope;
};

Namespace.prototype._walkNamespace = function(pathString, mode, optValue){
    var t = this;
    var nameParts;

    const ellipsisIdx = pathString.indexOf('...');
    if (ellipsisIdx !== -1) {
        if (ellipsisIdx === 0 && t._lastNamePrefix) {
            nameParts = t._lastNamePrefix.concat(pathString.slice(3).split(/\s*\.\s*/));
        } else {
            throw Error('Wrong usage of "..." syntax ' +
                'or no previous parameters with prefix occured: ' + pathString);
        }
    } else {
        nameParts = pathString.split(/\s*\.\s*/);
    }
    
    
    if (nameParts.length > 1){
        t._lastNamePrefix = nameParts.slice(0, -1);
    }
    
    var chain = t._ns;
    var prevChain = null;
    var key;

    var l = nameParts.length; //edge case: l==1 (single name) - works as well

    for (var i=0; i < l; i++){
        //the next comparison works both for objects and arrays
        if (Array.isArray(chain)){
            key = parseInt(nameParts[i]);
            if (isNaN(key)) return null; //just silently skip, arrays cannot contain keys for processing
            key = key - 1; //1-based indexes
        } else {
            key = nameParts[i]; //take it as string
        }
        
        if (typeof chain[key] === "undefined"){
            if (mode === "get") {
                //there is no entry looking for, as some middle chain of path is absent
                //we do not build it in "get" mode
                return null;
            }else{
                //this is a 'write' operation, add missing name chain here
                //test the next chain if it is array index or object key
                //so choose the type respectively
                var num = parseInt(nameParts[i+1]); //works also for the last undefined - the last scope should be {} anyway
                chain[key] = isNaN(num) ? {} : [];
            }
        }
        prevChain = chain;
        chain = chain[key];
    }

    if (mode === "get"){
        return {
            value: chain,
            scope: prevChain
        };
    } else if( mode === "set"){
        prevChain[key] = optValue;
        return {
            scope: prevChain
        }
    } else if (mode === "build"){
        if (! optValue) throw Error ("optValue for build mode should be Object or Array");
        //overrides this: scopeSegment[key] = isNaN(num) ? {} : [];
        prevChain[key] = optValue;
        return {
            scope: prevChain[key]
        }
    }
};

Lib.util.Namespace = Namespace;