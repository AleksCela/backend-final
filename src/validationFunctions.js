import database from "./databaseConnectivity.js";

async function CredentialsValidation(username,password){
    const username_exists = await database.raw(`select * from users where username='${username}'`);
    const reg_expression = /(?=.*[!?.:])(?=.*\d)/;
    const username_validation = username.length > 5 && username.length < 12 && username_exists.length == 0;
    const password_validation = password.length > 5 || password.length < 12 && reg_expression.test(password);
    
    if(!username_validation){
        throw new Error("The username is not valid!");
    }
    else if(!password_validation) {
        throw new Error("The password is not valid!");
    }
    else{
        return true;
    }
}

export default CredentialsValidation;