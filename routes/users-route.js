const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const usersController = require('../controllers/user-controller');
const fileUpload = require('../middleware/file-uploads');

router.get("/", usersController.getUsers);

router.post("/signup",
  fileUpload.single('image'),
  [
    check("email").isEmail().normalizeEmail(),
    check("name").notEmpty(),
    check("password").isLength({ min: 5 }).isAlphanumeric()
  ],
  usersController.userSignup);

router.post("/login", usersController.userLogin);

router.post("/reset-password", usersController.resetPassword);

router.post("/new-password", usersController.newPassword);

module.exports = router;

