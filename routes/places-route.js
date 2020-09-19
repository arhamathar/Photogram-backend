const express = require('express');
const { check } = require('express-validator');

const placesController = require('../controllers/places-controller');

const router = express.Router();

router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.post("/", [
  check('title').not().isEmpty(),
  check('description').isLength({ min: 6 }),
  check('address').not().isEmpty()],
  placesController.createPlace);

router.patch("/:pid", [
  check('title').not().isEmpty(),
  check('description').isLength({ min: 6 })],
  placesController.updatePlace);

router.delete("/:pid", placesController.deletePlace);

module.exports = router;