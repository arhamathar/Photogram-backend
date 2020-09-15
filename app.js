const express = require('express');
const bodyParser = require('body-parser');

const placeRoutes = require('./routes/places-route');
const userRoutes = require('./routes/users-route');

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placeRoutes);

app.use("/api/users", userRoutes);

//a middleware func with 4 arguments is a special function resposible for error handling.
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured." })
});

app.listen(3000, () => {
  console.log("Server running at port 3000.")
})