var DEBUG = true;

var UNDEF = "undefined";

var Lib = {};

var service = {
    //callback function for /usercallback platform endpoint
    currentUserCallbackProvider: function(){return HtmlService.createHtmlOutput('Callback function is NOT implemented!'); }
};

//global /usercallback function needed for accessing by name
function globalUserCallbackFunction(request){
    return service.currentUserCallbackProvider(request);
}

var CONSTANTS = {};


