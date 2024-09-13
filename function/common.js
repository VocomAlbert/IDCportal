const Query = require('../mysql_query');


module.exports.checkAccount = async function (userName, passWord) {
    let check = await Query("select * from webuser where BINARY account = ?  and BINARY password = ?", [userName, passWord]);
    if (check.length) {
        return 1
    } else {
        return 0
    }
}

module.exports.getAccountInfo = async function(account){
    let userinfo = Query('select level from webuser where account = ?',[account]);
    return userinfo;
}