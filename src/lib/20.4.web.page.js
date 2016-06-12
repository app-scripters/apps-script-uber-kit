function Page(urlParameters, defaultPage) {
    var t = this;
    t._url = ScriptApp.getService().getUrl();
    t._valid = null;
    t._urlPar = urlParameters;
    t._defaultPageName = defaultPage;
    t._pageName = (t._urlPar.page || '').toString().replace(/^\//, '');

    if (t._pageName === ''){
        t._pageName = t._defaultPageName;
    }
    
    //if _pageName was not '' and it is incorrect, e.g. blalba/strange*page
    //it remais such. Use isValid() to validate
    t._path = t._pageName.split('/');
    
    t._templateName = t._pageName.replace(/\//g, '_');
}

Page.prototype.getParameters = function () {
    var t = this;
    return t._urlPar;
};

Page.prototype.isValid = function () {
    var t = this;
    //memorize if already validated
    if(t._valid === null){
        t._valid = 
            (t._path.length >= 2) && 
            (t._path.length < 10) && //10 is some reasonable limit of nesting
            /\w+/.test(t._pageName.replace(/\//g, ''))
    }
    return t._valid;
};

Page.prototype.getUrl = function (templateName) { 
    var t = this;
    if (! templateName) return t._url;
    return t._url + '?page=' + 
        (templateName.replace(/_/g, '/') || t._pageName); 
};

Page.prototype.getName = function () {
    return this._pageName;
};

Page.prototype.getActionName = function () {
    return this._templateName;
};

Page.prototype.getPrefix = function () {
    return this._path[0];
};

Page.prototype.runController = function(conf) {
    var page = this;
    var pageName = page.getName();
    //this is also default template file name (without extension)
    var actionName = page.getActionName(); 
    if(! (pageName in controllers)){
        pageName = controllers.defaultController;
    }
    
    //pick up a controller
    var data = (controllers[pageName] || 
                controllers.defaultController)(conf, page, actionName);
    
    if (!data.template) data.template = actionName;
    if (! data.context) data.context = {};
    
    //page always should be in the context
    data.context.page = page; 
    data.context.conf = conf; 
    
    return data;
};



Lib.web.Page = Page;