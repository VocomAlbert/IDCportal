const Query = require('../mysql_query');

//account
module.exports.account_checkpassword = async function (account, oldPassword, newPassword, confirmPassword) {
    const pattern = /[!@#$%^&*()+{}:><?,./;]/;
    if(!oldPassword.match(pattern) && !newPassword.match(pattern) && !confirmPassword.match(pattern)){
        let pass = await Query("select password from webuser where account = ?",[account]);
        if(oldPassword != pass[0].password){
            //oldPassword doesn't match
            return 2;
        }

        if(oldPassword == newPassword){
            //oldPassword and newPassword should not be the same;
            return 3;
        }

        if(newPassword != confirmPassword){
            //newPassword and confirmPassword should be the same;
            return 4;
        }
        await Query("update webuser set password = ? where account = ?",[newPassword, account])
        return 0;
    }else{
        //include illegel symbol
        return 1;
    }
    
    
}