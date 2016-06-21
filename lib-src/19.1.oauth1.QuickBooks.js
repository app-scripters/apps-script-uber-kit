/**
 * Authorizes and makes a request to the QuickBooks API. Assumes the use of a
 * sandbox company.
 */

function QB(options){
    var t = this;
    //check if this is really object construction
    if (! t.serviceName) {
        throw new Error("you've forgotten 'new' keyword: var instance = new " + t.serviceName + "(...)");
    }

    t._props = options.store || PropertiesService.getUserProperties();
    t._isAuthCallback = options._isAuthCallback;
    
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
    
    //tracks Authorization process state.
    //we should NOT initiate authorization here in the constructor, 
    //because the same constructor
    //will be called in OAuth callback below, and request token will change otherwise
    t._auth = t._checkAuth();
    
    if (t._auth) {
        t._refreshData();
    }
}

QB.prototype.serviceName = 'QuickBooks';

QB.prototype._refreshData = function () {
    var t = this;
    t._data.companyId =  
        t._props.getProperty('QuickBooks.companyId');
};


QB.prototype._checkAuth = function (failedRequestData) {
    var t = this;
    
    //if we in the callback process, all below is not needed
    if (t._isAuthCallback) return false;
    
    if (failedRequestData) t.reset();
    
    if (failedRequestData || ! t._service.hasAccess()) {
        t._auth = false;
        //if not authorised, then call the handler to create a user-facing auth URL
        t.userOnDenied(t._service.authorize(), 
            failedRequestData ? ("Authorization reason: after failed request, data=" 
                + JSON.stringify(failedRequestData)) : ''
        );
    } else {
        t._auth = true;
    }
    return t._auth;
};


QB.prototype.reset = function() {
    this._auth = false;
    this._getService().reset();
};


QB.prototype.fetch = function(method, entity, idOrNull, params, payload) {
    var t = this;
    var noAuth = {auth: false, error: true};
    
    if (! t._auth) return noAuth;
    
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
        if (code === 401) { //no auth
            t._checkAuth({code: code, data: data, headers: response.getHeaders()});
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

        //this is NOT working for QuickBooks, using default method via headers
        //.setParamLocation('uri-query') 
        // Set the consumer key and secret.
        .setConsumerKey(t._creds.consumerKey)
        .setConsumerSecret(t._creds.consumerSecret)

        // Set the name of the callback function in the script referenced
        // above that should be invoked to complete the OAuth flow.
        .setCallbackFunction(t._callbackName)

        // Set the property store where authorized tokens should be persisted.
        .setPropertyStore(t._props);
};


QB.handleCallback = function(qbOptions, request, onAccess) {
    var t = new QB(Lib.util.extend({}, qbOptions, {
        _isAuthCallback: true
    }));
    
    t._service = t._getService();
    try {
        var authorized = t._service.handleCallback(request);
    }catch (e){
        return HtmlService.createHtmlOutput('<p><b>OAuth: Internal error: </b></p>' +
            '<p><b>' + e.message + '</b></p>',
            '<p>Please check your login/password for ' + t.serviceName + ', close this window, and re-run the script.</p>' + 
            '<p>Please contact your administrator, it the problem remains, with the error message above.</p>');
    }
    
    t._auth = authorized;
    
    if (authorized) {
        PropertiesService.getUserProperties()
            .setProperty('QuickBooks.companyId', request.parameter.realmId);
        t._refreshData();
        onAccess.call(t); //make sure service object is accessible under 'this'
        return HtmlService.createHtmlOutput('<b>OAuth Success! You may close this window.</b>');
    }else{
        return HtmlService.createHtmlOutput('<p><b>OAuth: Access DENIED!</b></p>' +
            '<p>Check login/password for ' + t.serviceName + ', close this window, and re-run the script.</p>' + 
            '<p>Please contact your administrator, it the problem remains after that.</p>');
    }
};


Lib.oauth1.QuickBooks = QB;