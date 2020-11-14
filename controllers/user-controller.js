const { v4: uuidv4 } = require('uuid');
const { check, validationResult } = require('express-validator');

const HttpError = require('../models/https-error');
const User = require('../models/user-model');

const DUMMY_USERS = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@gmail.com",
    password: "john"
  }
];

/*///////////******** Getting all users. ********\\\\\\\\\\\\\ */

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); // everything except password.
  } catch (error) {
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
  } catch (error) {
    return next(new HttpError("Signed Up failed, please try again !", 500));
  }
  if (hasUser) {
    return next(new HttpError("Signed Up failed, user already exists.", 422));
  }
  const newUser = new User({
    name,
    email,
    password,
    image: "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
    places: []
  });
  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError('Creating new user failed, please try again!', 500));
  }
  res.status(201).json({ newUser: newUser.toObject({ getters: true }) });
}; // newUser.toObject({ getters: true }) it copy _id field to id field.

/*///////////******** Login User . ********\\\\\\\\\\\\\ */

const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email })
  } catch (error) {
    return next(new HttpError("Logging In failed, please try again !", 500));
  }
  if (!identifiedUser || identifiedUser.password !== password) {
    return next(new HttpError("User not found , please check credentials", 404));
  }
  res.status(200).json({
    status: "Logged In",
    identifiedUser: identifiedUser.toObject({ getters: true })
  });
};

/*///////////******** Exporting all functions. ********\\\\\\\\\\\\\ */

exports.getUsers = getUsers;
exports.userSignup = userSignup;
exports.userLogin = userLogin;
