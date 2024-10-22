// All the logic is in controllers folder.

const fs = require('fs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/https-error');
const getCoordinates = require('../util/location');
const Place = require('../models/places-model');
const User = require('../models/user-model');

/* ///////////********** Getting place by place id ***********\\\\\\\\\\\\\*/

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find the place.', 500));
  }
  // if (!place) {
  //   const error = new Error('Could not find place for the provided id.')
  //   error.code = 404;
  //   throw error; //throw  is used in sync js. 
  // }
  // *************   ERROR HANDLING USING MODELS   *************
  if (!place) {
    throw new HttpError('Could not find place for the provided id.', 404);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

/* ///////////********** Getting place by user id ***********\\\\\\\\\\\\\*/

async function getPlacesByUserId(req, res, next) {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (error) {
    return next(new HttpError('Fetching places failed, please try again later!'), 500);
  }
  if (!places) {
    return next(new HttpError('Could not find places for the provided user id .', 404));
    //next() is used in async js.
  }
  // res.json({ places: places })// It also works we only have to use props. _id in place of props.id in userList component
  res.json({ places: places.map(place => place.toObject({ getters: true })) });
}

/* ///////////********** Creating new place ***********\\\\\\\\\\\\\*/

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid data entered, please enter valid data.", 422));
  }

  const { title, description, address } = req.body;
  let coordinates = await getCoordinates(address);

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    creator: req.userData.userId,
    image: req.file.path
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    return next(new HttpError('Creating new place failed, please try again!', 500));
  }

  if (!user) {
    return next(new HttpError('Could not find user for the provided ID.', 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError('Creating new place failed, please try again!', 500));
  }
  res.status(201);
  // res.json({ place: createdPlace }); this also works! 
  res.json({ place: createdPlace.toObject({ getters: true }) });
};

/* ///////////********** Updating place by place id ***********\\\\\\\\\\\\\*/

const updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid data entered, please enter valid data.", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not update place.", 500));
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place.", 401));
  }

  const updatedPlace = await Place.updateOne({
    _id: placeId
  },
    {
      title,
      description
    }, function (err) {
      if (err) {
        return next(new HttpError('Something went wrong, could not update place.', 500));
      }
    });

  res.status(200).json({ place: "Place updated successfully !" });
};

/* ///////////********** Delete place by place id ***********\\\\\\\\\\\\\*/

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = (await Place.findById(placeId));
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find the place.', 500));
  }

  if (!place) {
    return next(new HttpError('Could not find the place for the given Id.', 500));
  }

  const imagePath = place.image;
  const user = await User.findById(place.creator);

  if (req.userData.userId !== user.id) {
    return next(new HttpError("You are not allowed to delete this place.", 401));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    user.places.remove(place);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError('Could not delete place, please try again later.', 500));
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  });

  res.status(200).json({ message: "Place Deleted!" });
};

/*///////////******** Exporting all functions. ********\\\\\\\\\\\\\ */

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;