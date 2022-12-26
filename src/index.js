import express from "express";
import cors from "cors";
import database from "../src/databaseConnectivity.js";
import { validatePassword, validateEmail } from "../src/validationFunctions.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use("/", express.static("./public", { extensions: ["html"] }));

//API routes for account creation and user authentication  
app.post("/api/sign-up", async (request, response) => {
  const credentials = request.body;
  const email = credentials.email;
  const password = credentials.password;
  console.log(email, password);
  if (validatePassword(password) && await validateEmail(email)) {
    await database.raw(`insert into users (email, password) values ('${email}','${password}')`);
    const newAccount = await database.raw(`SELECT * FROM users ORDER BY id DESC LIMIT 1;`);
    response.status(200);
    response.json(newAccount);
  } else if (!validatePassword(password)) {
    response.status(401);
    response.json("Password is invalid");
  } else {
    response.status(401);
    response.json("Email is invalid");
  }
});

app.post("/api/login", async (request, response) => {
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

//API for updating the credentials
app.put("/api/update-email", async (request, response) => {
  const id = Number(request.body.id);
  const newEmail = request.body.newEmail;
  if (await validateEmail(newEmail)) {
    await database.raw(
      `update users set email = '${newEmail}' where id = ${id};`
    );
    response.status(200);
    response.json("Updated");
  } else {
    response.status(409);
    response.json("Error in update");
  }
});

app.put("/api/update-password", async (request, response) => {
  const { currentPassword, newPassword, id } = request.body;
  console.log(currentPassword, newPassword, id);
  if (validatePassword(newPassword)) {
    await database.raw(
      `update users set password = '${newPassword}' where id = ${id} AND password='${currentPassword}';`
    );
    response.status(200);
    response.json("Updated");
  } else {
    response.status(409);
    response.json("The new password is not OK!");
  }
});

 //API for users trips 
app.get("/api/trips/:id", async (request, response) => {
  const id = Number(request.params.id);
  const result = await database.raw(
    `select * from trips where user_id = ${id}`
  );
  response.status(200);
  response.json(result);

});

app.post("/api/trips", async (request, response) => {
  const trip = request.body;
  console.log(trip);
  await database.raw(
    `insert into trips (date, destination, description, days , rating, latitude , longitude , country, user_id) values ('${trip.date}','${trip.destination}','${trip.description}','${trip.days}','${trip.rating}','${trip.latitude}','${trip.longitude}','${trip.country}','${trip.user_id}')`
  );
  const newTrip = await database.raw(
    `SELECT * FROM trips ORDER BY id DESC LIMIT 1;`
  );
  response.status(200);
  response.json(newTrip);
});

//API for updating and deleting the selected trip
app.put("/api/trips/:id", async (request, response) => {
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
      country
    } = request.body;
    await database.raw(
      `update trips set date = '${date}', destination = '${destination}', description ='${description}', days ='${days}', rating ='${rating}', latitude ='${latitude}', longitude ='${longitude}', country = ${country} where id = ${id};`
    );
    const updatedTrip = await database.raw(
      `SELECT * FROM trips WHERE id = ${id};`
    );
    response.status(200);
    response.json(updatedTrip);
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
  response.json({ error: "This route does not exist!" });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});