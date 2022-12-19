import express from "express";
import cors from "cors";
import database from "../src/databaseConnectivity.js";
import credentialsValidation from "./validationFunctions.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use("/", express.static("./public", { extensions: ["html"] }));

//----------------------------------------------------------
//API routes for user authentication and account creation
app.post("/api/sign-up", async (request, response) => {
  const credentials = request.body;
  const email = credentials.email;
  const password = credentials.password;
  console.log(email, password);
  if (credentialsValidation(email, password)) {
    await database.raw(
      `insert into users (email, password) values ('${email}','${password}')`
    );
    const newAccount = await database.raw(
      `SELECT * FROM users ORDER BY id DESC LIMIT 1;`
    );
    response.status(200);
    response.json(newAccount);
  } else {
    response.status(401);
    response.json("email/password is invalid");
  }
});

app.post("/api/sign-in", async (request, response) => {
  const credentials = request.body;
  const email = credentials.email;
  const password = credentials.password;
  const authentication = await database.raw(
    `select email, id from users where email='${email}' AND password='${password}'`
  );
  if (authentication.length == 0) {
    response.status(401);
    response.json("Email and password do not match!");
  } else {
    response.status(200);
    response.json(authentication[0]);
  }
});

app.get("/api/trips/:id", async (request, response) => {
  //gets the trips with selected user_id
  const id = Number(request.params.id);
  const result = await database.raw(
    `select * from trips where user_id = ${id}`
  );
  response.status(200);
  response.json(result);
  console.log(result);
});

app.post("/api/trips", async (request, response) => {
  const trip = request.body;
  await database.raw(
    `insert into trips (date, destination, description, days , rating, latitude , longitude , user_id) values ('${trip.date}','${trip.destination}','${trip.description}','${trip.days}','${trip.rating}','${trip.latitude}','${trip.longitude}','${trip.user_id}')`
  );
  const newTrip = await database.raw(
    `SELECT * FROM trips ORDER BY id DESC LIMIT 1;`
  );
  response.status(200);
  response.json(newTrip);
});

app.put("/api/trips/:id", async (request, response) => {
  //updates the selected trip
  try {
    const id = Number(request.params.id);
    const {
      date,
      destination,
      description,
      days,
      rating,
      latitude,
      longitude,
    } = request.body;
    await database.raw(
      `update trips set date = '${date}', destination = '${destination}', description ='${description}', days ='${days}', rating ='${rating}', latitude ='${latitude}', longitude ='${longitude}' where id = ${id};`
    );
    response.status(200);
  } catch (error) {
    response.status(404);
    console.log("Error in update");
  }
});

app.put("/api/user/:id", async (request, response) => {
  //updates the credentials
  try {
    const id = Number(request.params.id);
    const { email, password } = request.body;
    await database.raw(
      `update users set email = '${email}', password = '${password}' where id = ${id};`
    );
    response.status(200);
  } catch (error) {
    response.status(404);
    console.log("Error in update");
  }
});

app.delete("/api/trips/:id", async (request, response) => {
  const id = Number(request.params.id);
  await database.raw(`delete from trips where id=${id}`);
  response.status(200);
  response.json(true);
});

app.all("/*", async (request, response) => {
  response.status(404);
  response.json({ error: "This route does not exist" });
});

const hostname = "localhost";
const port = 4000;
app.listen(port, hostname, () => {
  console.log(`Server listening on http://${hostname}:${port}`);
});
