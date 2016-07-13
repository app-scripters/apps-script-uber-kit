Lib.web.include = function(file, context){
    var tpl = HtmlService.createTemplateFromFile(file);
    if (context){
        Lib.util.extend(tpl, context);
    }
    return tpl.evaluate().getContent();
};