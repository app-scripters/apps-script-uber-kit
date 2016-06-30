function Page(options) {
    var t = this;
    options = options || {};
    t._url = ScriptApp.getService().getUrl();
    t._valid = null;
    t._urlPar = options.parameters || {};
    t._defaultPageName = options.defaultPage || 'index';
    t._controllers = options.controllers || 'index';
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
    var t = this;
    var pageName = t.getName();
    //this is also default template file name (without extension)
    var actionName = t.getActionName(); 
    if(! (pageName in t._controllers)){
        pageName = t._controllers.defaultController;
    }
    
    //pick up a controller
    var data = (t._controllers[pageName] || 
                t._controllers.defaultController)(conf, t, actionName);
    
    if (!data.template) data.template = actionName;
    if (! data.context) data.context = {};
    
    //page always should be in the context
    data.context.page = t; 
    data.context.conf = conf; 
    
    return data;
};


Page.prototype.isMe = function (actionName, textOnSuccess) {
    var res = actionName === this.getActionName();
    return textOnSuccess ? (res ? textOnSuccess : '') : res;
};

Lib.web.Page = Page;