const express = require('express');
const { check } = require('express-validator');

const placesController = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-uploads');

const router = express.Router();

router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.post("/",
  fileUpload.single('image'),
  [
    check('title').notEmpty(),
    check('description').isLength({ min: 6 }),
    check('address').notEmpty()
  ],
  placesController.createPlace);

router.patch("/:pid",
  [
    check('title').notEmpty(),
    check('description').isLength({ min: 6 })
  ],
  placesController.updatePlace);

router.delete("/:pid", placesController.deletePlace);

module.exports = router;