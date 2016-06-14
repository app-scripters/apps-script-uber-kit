/**
 * Authorizes and makes a request to the QuickBooks API. Assumes the use of a
 * sandbox company.
 */

var AUTH = {
    NO: -1,
    INRPOGRESS: 0,
    YES: 1
};

function QB(options){
    var t = this;
    t._name = 'QuickBooks';
    t._creds = {
        consumerKey: options.consumerKey, 
        consumerSecret: options.consumerSecret
    };
    if (! options.callback || typeof options.callback !== "string"){
        throw new Error("Oauth callback global function name should be specified in the 'callback' option!")
    }
    t._callbackName = options.callback;
    //onDenied is not needed for callback instance
    t.userOnDenied = options.onDenied || Lib.util.stub;
    t._service = t._getService();
    t._data = {};
    
    //tracks Authorization process state. If in progress
    //prevents from calling authorize() twice
    t._auth = AUTH.NO;
    
    if (t._checkAuth() === AUTH.YES) {
        t._refreshData();
    }
}

QB.prototype._refreshData = function () {
    var t = this;
    t._data.companyId =  
        PropertiesService.getUserProperties().getProperty('QuickBooks.companyId');
};


QB.prototype._checkAuth = function (doReset) {
    var t = this;
    
    if (t._auth === AUTH.INRPOGRESS) return t._auth;
    
    if (doReset) t.reset();
    
    if (doReset || ! t._service.hasAccess()) {
        t._auth = AUTH.INRPOGRESS;
        //if not authorised, then call the handler to create a user-facing auth URL
        t.userOnDenied(t._service.authorize());
    } else {
        t._auth = AUTH.YES;
    }
    return t._auth;
};


QB.prototype.reset = function() {
    this._auth = AUTH.NO;
    this._getService().reset();
};


QB.prototype.fetch = function(method, entity, idOrNull, params, payload) {
    var t = this;
    var noAuth = {auth: false, error: true};
    
    if (t._auth !== AUTH.YES) return noAuth;
    
    var companyId = t._data.companyId;

    var url = 'https://quickbooks.api.intuit.com/v3/company/' +
        companyId + '/' + entity +
        (idOrNull == null ? '' : ('/' + (idOrNull === '' ? companyId : idOrNull)));
    var opts = {
        method: method,
        headers: {
            'Accept': 'application/json'
        },
        muteHttpExceptions: true
    };
    if (method === 'post'){
        opts.payload = payload;
        opts.contentType = 'application/json';
    }
    
    var response = t._service.fetch(url + Lib.util.makeUrlParams(params), opts);
    var code = parseInt(response.getResponseCode());
    var data = response.getContentText();
    if (code != 200){
        if (code === 401) {
            t._checkAuth(true);
            return noAuth;
        }
        return {auth: true, error: true, code: code, data: data};
    }
    return {auth: true, error: false, code: 200, data: JSON.parse(data)};

};


QB.prototype.create = function(entity, json) {
    return this.fetch('post', entity, null, null, json);
};


QB.prototype.query = function(query) {
    var response = this.fetch('get', 'query', null, {query: query});
    if (! response.error) response.data = response.data.QueryResponse;
    return response;
};


QB.prototype.read = function(entity, id) {
    return this.fetch('get', entity, id);
};


QB.prototype.update = function(entity, json) {
    return this.fetch('post', entity, null, {operation: "update"}, json);
};


QB.prototype.remove = function(entity, id) {
    return this.fetch('post', entity, null, {operation: "delete"}, {
        "Id": String(id),
        "SyncToken": "0"
    });
};


QB.prototype._getService = function() {
    var t = this;
    return Vendor.OAuth1.createService('QuickBooks')
    // Set the endpoint URLs.
        .setAccessTokenUrl('https://oauth.intuit.com/oauth/v1/get_access_token')
        .setRequestTokenUrl('https://oauth.intuit.com/oauth/v1/get_request_token')
        .setAuthorizationUrl('https://appcenter.intuit.com/Connect/Begin')

        .setParamLocation('uri-query')
        // Set the consumer key and secret.
        .setConsumerKey(t._creds.consumerKey)
        .setConsumerSecret(t._creds.consumerSecret)

        // Set the name of the callback function in the script referenced
        // above that should be invoked to complete the OAuth flow.
        .setCallbackFunction(t._callbackName)

        // Set the property store where authorized tokens should be persisted.
        .setPropertyStore(PropertiesService.getUserProperties());
};


QB.prototype.handleCallback = function(request, onAccess) {
    var t = this;
    t._service = t._getService();
    var authorized = t._service.handleCallback(request);
    
    t._auth = authorized ? AUTH.YES : AUTH.NO;
    
    if (authorized) {
        PropertiesService.getUserProperties()
            .setProperty('QuickBooks.companyId', request.parameter.realmId);
        t._refreshData();
        onAccess.call(t); //make sure service object is accessible under 'this'
        return HtmlService.createHtmlOutput('OAuth Success! You may close this window.');
    }else{
        return HtmlService.createHtmlOutput('<p>OAuth: Access DENIED!</p>' +
            '<p>Check login/password for ' + t._name + ', close this window, and re-run the script.</p>' + 
            '<p>Contact your administrator, it the problem remains after that.</p>');
    }
};


Lib.oauth.QuickBooks = QB;