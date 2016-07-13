function ContentRenderer(baseData, jsonpCallback){
    var t = this;
    t._jsonpCallback = jsonpCallback || 'callback';
    t._baseData = baseData || null;
}

ContentRenderer.prototype.render = function (data, error){
    var t = this;
    
    var result = {
        error: error ? error : false,
        data: t._baseData ? Lib.util.extend({}, t._baseData, data) : data,
        systemError: null
    };
    
    return t._respond(result);
};

ContentRenderer.prototype.systemError = function (exception) {
    var t = this;
    var tr = Lib.util.trace(exception);
    var message = DEBUG ? tr.replace(/\n/g, '   ===>   ') : String(exception);
    var error = {
        error: "System error",
        data: {},
        systemError: message
    };
    
    return t._respond(error);
};

ContentRenderer.prototype._respond = function (what) {
    return ContentService.createTextOutput(this._jsonpCallback + '(' + JSON.stringify(what) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
};

Lib.web.ContentRenderer = ContentRenderer;