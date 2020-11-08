const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const usersController = require('../controllers/user-controller');

router.get("/", usersController.getUsers);

router.post("/signup", [
  check("email").isEmail().normalizeEmail(),
  check("name").notEmpty(),
  check("password").isLength({ min: 5 }).isAlphanumeric()],
  usersController.userSignup);

router.post("/login", usersController.userLogin);

module.exports = router;

