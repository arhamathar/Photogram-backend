const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/https-error');
const { check, validationResult } = require('express-validator');

const DUMMY_USERS = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@gmail.com",
    password: "john"
  }
];

const getUsers = (req, res, next) => {
  res.status(200).json({ user: DUMMY_USERS });
};

const userSignup = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError('Invalid data entered, please enter data correctly', 422);
    console.log(error);
  }

  const { username, email, password } = req.body;
  const hasUser = DUMMY_USERS.find(u => {
    return u.username === username;
  });
  if (hasUser) {
    throw new HttpError("Could not create new user, user already exists.", 422);
  }
  const newUser = {
    id: uuidv4(),
    username,
    email,
    password
  };
  DUMMY_USERS.push(newUser);
  res.status(201).json({ newUser: newUser });
};

const userLogin = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find(u => {
    return u.email === email;
  });
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("User not found , check credentials", 404);
  }
  res.status(200).json({ status: "Logged In" })
};

exports.getUsers = getUsers;
exports.userSignup = userSignup;
exports.userLogin = userLogin;
