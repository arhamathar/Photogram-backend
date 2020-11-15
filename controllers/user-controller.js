const { v4: uuidv4 } = require('uuid');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/https-error');
const User = require('../models/user-model');


/*///////////******** Getting all users. ********\\\\\\\\\\\\\ */

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); // everything except password.
  }
  catch (error) {
    return next(new HttpError('Fetching users failed, please try again later.'));
  }
  // res.status(200).json({ user: users });
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

/*///////////******** Sign Up User. ********\\\\\\\\\\\\\ */

const userSignup = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error);
    return next(new HttpError('Invalid data entered, please enter data correctly', 422));
  }

  const { name, email, password } = req.body;
  let hasUser;

  try {
    hasUser = await User.findOne({ email })
  }
  catch (error) {
    return next(new HttpError("Signed Up failed, please try again !", 500));
  }

  if (hasUser) {
    return next(new HttpError("Signed Up failed, user already exists.", 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  }
  catch (err) {
    return next(new HttpError("Could not create user, please try again!", 500));
  }

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: []
  });

  try {
    await newUser.save();
  }
  catch (error) {
    return next(new HttpError('Creating new user failed, please try again!', 500));
  }

  let token;
  try {
    token = jwt.sign({
      userId: newUser.id, // data you want to encode into the token
      email: newUser.email
    },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );
  }
  catch (error) {
    return next(new HttpError("Signing up failed, please try again lataer", 500));
  }

  res.status(201).json({
    userId: newUser.id,
    email: newUser.email,
    token: token
  });
}; // newUser.toObject({ getters: true }) it copy _id field to id field.

/*////////////////******** Login User . ********\\\\\\\\\\\\\\\\\\\ */

const userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email })
  }
  catch (error) {
    return next(new HttpError("Logging In failed, please try again !", 500));
  }

  if (!identifiedUser) {
    return next(new HttpError("User not found , please check email.", 401));
  }

  let isValidUser = false;
  try {
    isValidUser = await bcrypt.compare(password, identifiedUser.password)
  }
  catch (err) {
    return next(new HttpError("Could not log you in, please check your credentials and try again.", 500));
  }

  if (!isValidUser) {
    return next(new HttpError("Invalid credentials, please check your password.", 401));
  }

  let token;
  try {
    token = jwt.sign({
      userId: identifiedUser.id,
      email: identifiedUser.email
    },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );
  }
  catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    userId: identifiedUser.id,
    email: identifiedUser.email,
    token: token
  });
};

/*///////////******** Exporting all functions. ********\\\\\\\\\\\\\ */

exports.getUsers = getUsers;
exports.userSignup = userSignup;
exports.userLogin = userLogin;
