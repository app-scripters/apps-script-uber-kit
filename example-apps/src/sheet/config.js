module.exports = {
    name: 'sheet',  //app name
    //Modules: 
    // - external (3rd p[arty vendor, pre-sliced into appropriate files in the vendor-src
    // - library modules (src)
    // - app modules
    //pattern matching typically may be done against first 2 figures "x.x."
    //NOTE ! ! !   "x.0." patterns (second digit = 0) will not be wrapped into (function(){])(); 
    // - they are treated as global header definitions
    modules: {
        //this is an array of patterns of what to be included from vendor-src
        external: ['*'],
        //what to be included from src
        library: ['1.*', '2.*', '19.*'],
        //what to be included from this app source folder (appmname/app)
        app: ['*']
    }
};

