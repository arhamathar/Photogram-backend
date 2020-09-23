require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/https-error');
const placesRoutes = require('./routes/places-route');
const usersRoutes = require('./routes/users-route');

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw new HttpError("Route not defined", 404);
});

//a middleware func with 4 arguments is a special function resposible for error handling.
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured." })
});

mongoose.connect(`mongodb+srv://athararham:${process.env.MONGODB_USER_KEY}@cluster0.ybatv.mongodb.net/first_mernDB?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(() => {
    app.listen(3000, () => {
      console.log("Server running at port 3000.")
    })
  }).catch(err => {
    console.log(err);
  });
