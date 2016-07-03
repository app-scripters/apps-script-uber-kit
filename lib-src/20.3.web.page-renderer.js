
function Renderer(rootTemplate){
    var t = this;
    t._plainTemplates = {};
    //root context, is applied to all templates before other contexts when rendering
    t._context = {};
    t._baseTemplate = rootTemplate ? 
        HtmlService.createTemplateFromFile(rootTemplate) :
        null; //will work for system error rendering
}

Renderer.prototype.setPlainTemplates = function (plainTemplates) {
    this._plainTemplates = plainTemplates;
    return this;
};

Renderer.prototype.setContext = function (data) {
    this._context = data;
    return this;
};

Renderer.prototype.renderAsRoot = function (templateName, pageContext) {
    return this._render(false, templateName, pageContext);
};

Renderer.prototype.render = function (templateName, pageContext) {
    return this._render(true, templateName, pageContext);
};

function makeTemplate(templateName, plainTemplates){
    var template, plainTemplate = plainTemplates[templateName];
    if (plainTemplate){
        template = HtmlService.createTemplate(plainTemplate);
    }else{
        template = HtmlService.createTemplateFromFile(templateName);
    }
    return template;
}

Renderer.prototype._render = function (inheritFromRoot, templateName, pageContext){
    var t = this;
    
    if (! t._baseTemplate) throw Error("Base Template should be present for regular render");
    
    if (_.isObject(templateName)) {
        pageContext = templateName.context;
        templateName = templateName.template;
    }
    var viewTemplate = makeTemplate(templateName, t._plainTemplates);
    
    var currentContext = Lib.util.extend({}, t._context, pageContext);
    
    Lib.util.extend(viewTemplate, currentContext);
    
    var template;
    if (inheritFromRoot){
        //root template should update its current context too
        Lib.util.extend(t._baseTemplate, currentContext);

        //now, render our view template into the base with bounded context
        t._baseTemplate.viewContent = 
            viewTemplate.evaluate().getContent();
        
        template = t._baseTemplate;            
    }else{
        template = viewTemplate;
    }
    
    // Build and return HTML in IFRAME sandbox mode.
    return template.evaluate()
        .setTitle(t._context.appTitle || 'Web App')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    
};

Renderer.prototype.renderError = function(templateName, exception) {
    var t = this;
    var template = makeTemplate(templateName, t._plainTemplates);
    template.exception = exception;
    return template.evaluate()
        .setTitle('Error')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
};

Lib.web.Renderer = Renderer;
