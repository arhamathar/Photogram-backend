require('dotenv').config();
const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const connectDB = require('./util/connectDb');
const HttpError = require('./models/https-error');
const placesRoutes = require('./routes/places-route');
const usersRoutes = require('./routes/users-route');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw new HttpError("Route not defined", 404);
});

//a middleware func with 4 arguments is a special function resposible for error handling.
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    }); // path is property that exist in file object.
  }

  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured." })
});

connectDB().then(() => {
  app.listen(5000, () => {
    console.log("Server running at port 5000.")
  });
}).catch(err => {
  console.log(err);
});
