function showSimpleSidebar(AppType, options, context) {
    const width = 300;
    options = options || {};
    //try {
    const template = HtmlService.createTemplateFromFile(options.templateName || "sidebar");
    if (context){
        Lib.util.extend(template, context);
    }
    const output = template.evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .setTitle(options.title || 'Tools')
        .setWidth(width); //non-changable now ===300 px

    AppType.getUi().showSidebar(output);
    //} catch(e){
    //    Logging.log(e.message);
    //}
}

Lib.ui.showSimpleSidebar = showSimpleSidebar;