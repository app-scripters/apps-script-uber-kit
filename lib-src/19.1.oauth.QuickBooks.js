/**
 * Authorizes and makes a request to the QuickBooks API. Assumes the use of a
 * sandbox company.
 */

function QB(credentials, onResumeAccess, onDenied){
    var t = this;
    t._creds = credentials;
    service.currentUserCallbackProvider = function(request){
        return t._authCallback(request)
    };
    t.userOnDenied = onDenied;
    t.userOnAccess = onResumeAccess;
    t._service = t._getService();
    t._refreshData();
    t._checkAuth();
}


QB.prototype._refreshData = function () {
    var t = this;
    t._data = {};
    t._data.companyId =  
        PropertiesService.getUserProperties().getProperty('QuickBooks.companyId');
};


QB.prototype._checkAuth = function () {
    var t = this;
    if (! t._service.hasAccess()) {
        //if not authorised, then call the handler to create a user-facing auth URL
        t.userOnDenied(t._service.authorize());
    }
    //else just proceed with the call to API via OAuth    
};

QB.prototype.fetch = function(method, entity, idOrNull, params, payload) {
    var t = this;
    
    var companyId = t._data.companyId;

    var url = 'https://quickbooks.api.intuit.com/v3/company/' +
        companyId + '/' + entity +
        (idOrNull == null ? '' : ('/' + (idOrNull === '' ? companyId : idOrNull)));
    var opts = {
        method: method,
        headers: {
            'Accept': 'application/json'
        }
    };
    if (method === 'post'){
        opts.payload = payload;
        opts.contentType = 'application/json';
    }
    
    var response = t._service.fetch(url + Lib.util.makeUrlParams(params), opts);
    if (response.getResponseCode() != 200){
        t._checkAuth();
        return null;
    }
    return JSON.parse(response.getContentText());

};

QB.prototype.create = function(entity, json) {
    return this.fetch('post', entity, null, null, json);
};

QB.prototype.query = function(query) {
    return this.fetch('get', 'query', null, {query: query}).QueryResponse;
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

        // Set the consumer key and secret.
        .setConsumerKey(t._creds.consumerKey)
        .setConsumerSecret(t._creds.consumerSecret)

        // Set the name of the callback function in the script referenced
        // above that should be invoked to complete the OAuth flow.
        .setCallbackFunction('globalUserCallbackFunction')

        // Set the property store where authorized tokens should be persisted.
        .setPropertyStore(PropertiesService.getUserProperties());
};


QB.prototype.reset = function() {
    this._getService().reset();
};

QB.prototype._authCallback = function(request) {
    var t = this;
    t._service = t._getService();
    var authorized = t._service.handleCallback(request);
    if (authorized) {
        PropertiesService.getUserProperties()
            .setProperty('QuickBooks.companyId', request.parameter.realmId);
        t._refreshData();
        t.userOnAccess();
    }else{
        t.userOnDenied(t._service.authorize());
    }
};

Lib.oauth.QuickBooks = QB;