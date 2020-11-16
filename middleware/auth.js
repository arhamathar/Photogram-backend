const jwt = require('jsonwebtoken');
const HttpError = require('../models/https-error');

const protect = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next(); // to allow options request to continue.
  }

  try {
    const token = req.headers.authorization.split(' ')[1]; //authorization is the header which we set in CORS.
    // Authorization: 'Bearer Token'

    if (!token) {
      return new Error("Authoization Failed, please log in again.")
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  }
  catch (err) {
    return next(new HttpError(
      "You are not authorized to visit this route, please log in.",
      403
    ));
  }
}

module.exports = protect;