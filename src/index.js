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








const hostname = 'localhost';
const port = 4000;
app.listen(port, hostname, () => {
    console.log(`Server listening on http://${hostname}:${port}`)
});