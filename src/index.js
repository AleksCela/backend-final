import express from 'express';
import cors from 'cors'
import database from "../src/databaseConnectivity.js";
import credentialsValidation from './validationFunctions.js';

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.use('/', express.static('./public', { extensions: ['html'] }));

//----------------------------------------------------------
//API routes for user authentication and account creation
app.post('/api/sign-up', async (request, response) => {
    const credentials = request.body
    const email = credentials.email;
    const password = credentials.password
    console.log(email, password);
    if (credentialsValidation(email, password)) {
        await database.raw(`insert into users (email, password) values ('${email}','${password}')`)
        const newAccount = await database.raw(`SELECT * FROM users ORDER BY id DESC LIMIT 1;`)
        response.status(200)
        response.json(newAccount)
    } else {
        response.status(401)
        response.json("email/password is invalid")
    }
});

app.post('/api/sign-in', async (request, response) => {
    const credentials = request.body
    const email = credentials.email;
    const password = credentials.password
    const authentication = await database.raw(`select email, id from users where username='${email}' AND password='${password}'`)
    if (authentication.length == 0) {
        response.status(401)
        response.json("Email and password do not match!")
    } else {
        response.status(200)
        response.json(authentication[0])
    }
});








const hostname = 'localhost';
const port = 4000;
app.listen(port, hostname, () => {
    console.log(`Server listening on http://${hostname}:${port}`)
});