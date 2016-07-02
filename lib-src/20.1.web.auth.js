function Auth(roles){
    var t = this;
    t._runningUser = Session.getActiveUser().getEmail();
    t._roles = roles;
}

Auth.prototype.getEmail = function () {
    return this._runningUser;
};

Auth.prototype.validate = function (userEmail) {
    var t = this;
    
    var emailToCheck = (userEmail ? userEmail : t._runningUser).toLowerCase();
    var domainToCheck = emailToCheck.replace(/.*@/, '*@');
    
    var emails = t._roles.ALL.trim().toLowerCase();
    
    return emails === 'all' || 
        emails.indexOf(domainToCheck) !== -1 || 
        emails.indexOf(emailToCheck) !== -1; 
};   

Auth.prototype.validateRole = function (page, userEmail) {
    var t = this;
    
    var pageModule = page.getModule().toLowerCase();
    var roles = t._roles.group;
    var emailToCheck = (userEmail ? userEmail : t._runningUser).toLowerCase();
    var domainToCheck = emailToCheck.replace(/.*@/, '*@');
    //need to check permissions to this specific page
    //return after having found the first role permitting this page
    for (var roleName in roles) {
        var role = roles[roleName];

        var emails = role.emails.trim().toLowerCase();

        var modules = role.modules.trim().toLowerCase();

        if ((
                emails === 'all' ||
                emails.indexOf(domainToCheck) !== -1 || 
                emails.indexOf(emailToCheck) !== -1
            ) && (
                modules === 'all'  || 
                modules.indexOf(pageModule) !== -1
        )){
            return true;
        }
    }
    
    return false;
};

Lib.web.Auth = Auth;