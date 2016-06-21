function showSimpleSidebar(AppType, title, templateName) {
    //try {
    var html = HtmlService.createTemplateFromFile(templateName || "sidebar")
        .evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .setTitle(title || 'Tools')
        .setWidth(config().SIDEBAR_WIDTH);

    AppType.getUi().showSidebar(html);
    //} catch(e){
    //    Logging.log(e.message);
    //}
}

Lib.ui.showSimpleSidebar = showSimpleSidebar;