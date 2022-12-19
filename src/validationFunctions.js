import database from "./databaseConnectivity.js";

async function credentialsValidation(email, password) {
    const email_exists = await database.raw(`select * from users where email='${email}'`);
    const reg_expression = /(?=.*[!?.:])(?=.*\d)/;
    const email_validation = email.length > 5 && email.length < 20 && email_exists.length == 0;
    const password_validation = password.length > 5 || password.length < 20 && reg_expression.test(password);

    if (!email_validation) {
        throw new Error("The email is not valid!");
    }
    else if (!password_validation) {
        throw new Error("The password is not valid!");
    }
    else {
        return true;
    }
}

export default credentialsValidation;