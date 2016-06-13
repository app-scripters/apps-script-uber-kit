var DEBUG = true;

var UNDEF = "undefined";

var Lib = {};

var service = {
    //callback function for /usercallback platform endpoint
    currentUserCallbackProvider: function(){}
};

//global /usercallback function needed for accessing by name
function globalUserCallbackFunction(request){
    service.currentUserCallbackProvider(request);
}

var CONSTANTS = {};


