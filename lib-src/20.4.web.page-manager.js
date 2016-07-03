function PageManager(options){
    var t = this;
    var err = false;
    options = options || {};
    t._url = PageManager.getRootUrl();
    
    t._conf = options.conf || {};
    t._defaultPageName = options.defaultPage || (err = '"defaultPage" is the obligatory option');
    t._controllers = options.controllers || (err = '"controllers" is the obligatory option');
    t._rootExtraContext = null;
    if (err) throw Error(err);
}

PageManager.prototype.setContext = function(context){
    this._rootExtraContext = context;
    return this;
};

PageManager.getRootUrl = function () { 
    return ScriptApp.getService().getUrl(); 
};

PageManager.prototype.fromQuery = function(queryParameters){
    return new Page(queryParameters.page, this._defaultPageName, PageManager.getRootUrl(), this);    
};

PageManager.prototype.fromName = function(pageName){
    return new Page(pageName, null, PageManager.getRootUrl(), this);    
};

PageManager.makePageUrl = function (baseUrl, pageName) {
    return baseUrl + '?page=' + pageName;
};

PageManager.prototype.runController = function(page, extraContext) {
    var t = this;
    var pageName = page.getName();
    //this is also default template file name (without extension)
    var actionName = page.getAction(); 
    if(! (pageName in t._controllers)){
        pageName = t._controllers.defaultController;
    }
    
    //pick up a controller
    var data = (t._controllers[pageName] || 
                t._controllers.defaultController)(t._conf, page, actionName);
    
    if (! data.template) data.template = actionName;
    if (! data.context) data.context = {};
    if (t._rootExtraContext) data.context = _.extend({}, t._rootExtraContext, data.context);
    if (extraContext) _.extend(data.context, extraContext);
    
    //page always should be in the context
    data.context.page = page; 
    //TODO: alternative mechanism of passing front-end params -- data.context.parameters = <somewhat>; 
    
    return data;
};


//=======================================================================================================


function Page(nameOrAction, defaultPage, url, manager) {
    var t = this;
    
    t._manager = manager;
    
    t._pageName = t.actionToName(String(nameOrAction || '').replace(/^\//, '')); //truncate leading slash

    if (t._pageName === ''){
        if(! defaultPage) throw Error('Page: Default page is omitted, but pageName is empty');
        t._pageName = defaultPage;
    }
    
    t._url = url;
    
    //if _pageName was not '' and it is incorrect, e.g. blalba/strange*page
    //it remais such. Use isValid() to validate
    t._path = t._pageName.split('/');
    
    t._actionName = t._pageName.replace(/\//g, '_');
}

Page._validationPattern = /^[\-\w]+\/[\-\w]+(\/[\-\w]+)*$/;

Page.prototype.isValid = function () {
    return Page._validationPattern.test(this._pageName)
};

Page.prototype.actionToName = function (action) {
    return action.replace(/_/g, '/');
};
/**
 * Gets URL of the  other page
 * @param templateName - other page name or action, or empty for default page
 * @returns {*}
 */
Page.prototype.getUrlOf = function (templateName) { 
    if (! templateName) return this._url; //just forward to default URL
    return PageManager.makePageUrl(this._url, this.actionToName(templateName)); 
};

Page.prototype.getUrl = function () {
    return PageManager.makePageUrl(this._url, this._pageName); 
};

Page.prototype.getRootUrl = function () { 
    return this._url; 
};

Page.prototype.getName = function () {
    return this._pageName;
};

Page.prototype.getAction = function () {
    return this._actionName;
};

Page.prototype.getModule = function () {
    return this._path[0];
};

Page.prototype.runController = function (context) {
    var t = this;
    return t._manager.runController(t, context)
};

Lib.web.PageManager = PageManager;