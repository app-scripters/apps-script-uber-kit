
function Renderer(appTitle, rootTemplate, contextName, context){
    var t = this;
    t._appTitle = appTitle;
    t._rootTemplate = rootTemplate || "index";
    //root context, is applied to all templates before other contexts when rendering
    t._context = context;
    t._contextName = contextName;
    t._baseTemplate = HtmlService.createTemplateFromFile(t._rootTemplate);
}

Renderer.prototype.renderAsRoot = function (templateName, pageContext) {
    return this._render(false, templateName, pageContext);
};

Renderer.prototype.render = function (templateName, pageContext) {
    return this._render(true, templateName, pageContext);
};

Renderer.prototype._render = function (inheritFromRoot, templateName, pageContext){
    var t = this;
    
    var viewTemplate = HtmlService.createTemplateFromFile(templateName);
    
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
