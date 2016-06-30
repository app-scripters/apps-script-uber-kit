
function Renderer(appTitle, rootTemplate){
    var t = this;
    t._appTitle = appTitle;
    t._plainTemplates = {};
    t._rootTemplate = rootTemplate || "index";
    //root context, is applied to all templates before other contexts when rendering
    t._context = {};
    t._contextName = 'context';
    t._baseTemplate = HtmlService.createTemplateFromFile(t._rootTemplate);
}

Renderer.prototype.plainTemplates = function (plainTemplates) {
    this._plainTemplates = plainTemplates;
    return this;
};

Renderer.prototype.setContext = function (name, data) {
    this._contextName = name;
    this._context = data;
    return this;
};

Renderer.prototype.renderAsRoot = function (templateName, pageContext) {
    return this._render(false, templateName, pageContext);
};

Renderer.prototype.render = function (templateName, pageContext) {
    return this._render(true, templateName, pageContext);
};

Renderer.prototype._render = function (inheritFromRoot, templateName, pageContext){
    var t = this;
    
    var plainTemplate = t._plainTemplates[templateName];
    
    var viewTemplate = HtmlService['createTemplate' + (plainTemplate ? '' : 'FromFile')](templateName);
    
    var currentContext = Lib.util.extend({}, t._context, pageContext);
    
    viewTemplate[t._contextName] = currentContext;
    
    var template;
    if (inheritFromRoot){
        //root template should update its current context too
        t._baseTemplate[t._contextName] = currentContext;

        //now, render our view template into the base with bounded context
        t._baseTemplate.viewContent = 
            viewTemplate.evaluate().getContent();
        
        template = t._baseTemplate;            
    }else{
        template = viewTemplate;
    }
    
    // Build and return HTML in IFRAME sandbox mode.
    return template.evaluate()
        .setTitle(t._appTitle)
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    
};

Renderer.renderError = function(templateName, exception) {
    var template = HtmlService.createTemplateFromFile(templateName);
    template.exception = exception;
    return template.evaluate()
        .setTitle('Error')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
};

Lib.web.Renderer = Renderer;
