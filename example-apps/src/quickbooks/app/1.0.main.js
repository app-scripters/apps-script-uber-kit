var CONSUMER_KEY = 'your_consumer_key';
var CONSUMER_SECRET = 'your_consumer_secret';

var QB  = Lib.oauth1.QuickBooks;

var qbOptions = {
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET,
    callback: 'oauthCallback'
};

qbOptions.onDenied = function(authorizationUrl, optMessage) {
    showSidebar(
        '<p><a href="<?= authorizationUrl ?>" target="_blank" style="font-size: 16px">Authorize</a></p>. ' +
        '<p>Reopen the sidebar when the authorization is complete.</p>' + 
        '<p style="color: red"><?= message ?></p>', 
        {authorizationUrl: authorizationUrl, message: optMessage});
};

//====================================================================
///usercallback function must be global
function oauthCallback(request){
    return QB.handleCallback(qbOptions, request, function(){
       query(this);
    })
}
//====================================================================

function runTest() {
    var qb = new QB(qbOptions);
    query(qb);
}


function query(qb) {
    
    var result = qb.query('select * from estimate');
    
    if(! result.auth) return; //sidebar with auth prompt already shown
    
    showSidebar('<p> error:' + result.error + ', code: ' + result.code + ' <br /> data: ' + JSON.stringify(result.data) + '</p>');
}

function showSidebar(tpl, vars) {
    var template = HtmlService.createTemplate(tpl);
    if (vars) Lib.util.extend(template, vars);
    var page = template.evaluate();
    SpreadsheetApp.getUi().showSidebar(page);
}

function onOpen() {
    var ui = SpreadsheetApp.getUi();
    // Or DocumentApp or FormApp.
    ui.createMenu('[ SCRIPT ]')
    //.addItem('Process row', 'processRow')
    //.addSeparator()
        .addItem('Run QB API test', 'runTest')
        // .addSeparator()
        // .addSubMenu(SpreadsheetApp.getUi().createMenu('Google Calendar')
        //     .addItem('Update Active Measures (Schedule->Calendar)', 'runUpdateCalendar')
        .addToUi();
}



