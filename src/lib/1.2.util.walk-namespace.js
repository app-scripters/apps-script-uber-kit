/**
 * Finds (and optionally creates) proper sub-object in the namespace base object by string path
 * @param  {Object} baseNS         Base object
 * @param  {string} namePathString like "A.B.C"m where C is a target name for value placing
 * @param {string} optValue   --- value to write, if it is specified, this is a write operation
 */
function walkNamespace(baseNS, namePathString, optValue) {

    var nameParts;

    if (namePathString.indexOf('...') !== -1) {
        if (namePathString.indexOf('...') === 0 && walkNamespace.lastNamePrefix) {
            nameParts = walkNamespace.lastNamePrefix.concat(namePathString.slice(3).split(/\s*\.\s*/));
        } else {
            throw Error('Wrong usage of "..." syntax ' +
                'or no previous parameters with prefix occured: ' + namePathString);
        }
    } else {
        nameParts = namePathString.split(/\s*\.\s*/);
    }


    if (nameParts.length > 1) {
        walkNamespace.lastNamePrefix = nameParts.slice(0, -1);
    }

    var part = baseNS;

    var l = nameParts.length; //edge case: l==1 (single name) - works as well

    for (var i = 0; i < (l - 1); i++) {
        //the next comparison works both for objects and arrays
        var key;
        if (Lib.util.isArray(part)) {
            key = parseInt(nameParts[i]);
            if (isNaN(key)) return null; //just silently skip, arrays cannot contain keys for processing
            key = key - 1; //1-based indexes
        } else {
            key = nameParts[i]; //take it as string
        }

        if (typeof part[key] === "undefined") {
            if (typeof optValue !== "undefined") {
                //this is a 'write' operation, add missing name chain here
                //test the next chain if it is array index or object key
                //so choose the type respectively
                var num = parseInt(nameParts[i + 1]);
                part[key] = isNaN(num) ? {} : [];
            } else {
                //there is no such entry
                return null;
            }
        }
        part = part[nameParts[i]];
    }

    if (typeof optValue !== "undefined") {
        part[nameParts[l - 1]] = optValue
    }

    return part[nameParts[l - 1]];
}

walkNamespace.lastNamePrefix = null;

Lib.util.walkNamespace = walkNamespace;