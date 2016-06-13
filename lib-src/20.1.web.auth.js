function Auth(confInstance){
    var t = this;
    t._runningUser = Session.getActiveUser().getEmail();
    t._params = confInstance;
}

Auth.prototype.getEmail = function () {
    return this._runningUser;
};

Auth.prototype.validate = function (userEmail) {
    var t = this;
    
    var emailToCheck = userEmail ? userEmail : t._runningUser;
    
    //just need to check if user has access at all (is in ALL group)
    return t._params.role[CONSTANTS.ROLE_ALL].indexOf(emailToCheck) !== -1;

};   

Auth.prototype.validateRole = function (page, userEmail) {
    var t = this;
    
    var emailToCheck = userEmail ? userEmail : t._runningUser;
    
    //need to check permissions to this specific page
    //return after having found the first role permitting this page
    for (var role in CONSTANTS.ROLE) {
        //log('role', role);
        if (t._params.role[role].indexOf(emailToCheck) !== -1 &&
            CONSTANTS.ROLE[role].allowedPrefixes.indexOf(page.getPrefix()) !== -1 
        ){
            return true;
        }
    }
    
    return false;
};

Lib.web.Auth = Auth;