const { v4: uuidv4 } = require('uuid');
const { check, validationResult } = require('express-validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const HttpError = require('../models/https-error');
const User = require('../models/user-model');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.NODEMAILER_KEY
  }
}));

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

  try {
    await transporter.sendMail({
      to: newUser.email,
      from: "me.rahulsingh789@gmail.com",
      subject: "Sign up Successful !",
      html: "<h1>Welcome to PhotoGram</h1>"
    });
  } catch (err) {
    const message = err;
    return next(new HttpError(message, 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },  // data you want to encode into the token
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
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
    return next(new HttpError("User not found , please check email.", 403));
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
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
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

/*////////////////******** Reseting Password . ********\\\\\\\\\\\\\\\\\\\ */

const resetPassword = async (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return next(err);
    }

    const token = buffer.toString('hex');

    const email = req.body.email;
    let user;
    try {
      user = await User.findOne({ email });
    }
    catch (err) {
      return next(new HttpError("Resetting password failed, please try again !", 500));
    }
  });
};



/*///////////******** Exporting all functions. ********\\\\\\\\\\\\\ */

exports.getUsers = getUsers;
exports.userSignup = userSignup;
exports.userLogin = userLogin;
exports.resetPassword = resetPassword;
