// All the logic is in controllers folder.

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
  res.status(200).json({ place }); //{place: place} if key and value are equal;
};

/* ///////////********** Getting place by user id ***********\\\\\\\\\\\\\*/

async function getPlacesByUserId(req, res, next) {
  const userId = req.params.uid;
  let place;
  try {
    place = await Place.find({ creator: userId });
  } catch (error) {
    return next(new HttpError('Fetching place failed, please try again later!'), 500);
  }
  if (!place) {
    return next(new HttpError('Could not find place for the provided user id .', 404));
    //next() is used in async js.
  }
  res.json({ place })
}

/* ///////////********** Creating new place ***********\\\\\\\\\\\\\*/

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid data entered, please enter valid data.", 422);
  }
  const { title, description, address, creator } = req.body;
  let coordinates = await getCoordinates(address);

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    creator,
    image: "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg"
  });

  let user;
  try {
    user = await User.findById(creator);
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
  res.json({ place: createdPlace });
};

/* ///////////********** Updating place by place id ***********\\\\\\\\\\\\\*/

const updatePlace = async (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatedPlace = await Place.updateOne({
    _id: placeId
  },
    {
      title,
      description
    }, function (err) {
      if (err) {
        return next(new HttpError('Something went wrong, could not update place.', 500));
      } else {
        console.log("Successfully Updated")
      }
    });
  res.status(200).json({ place: "Place updated successfully !" });
};

/* ///////////********** Delete place by place id ***********\\\\\\\\\\\\\*/

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find the place.', 500));
  }

  if (!place) {
    return next(new HttpError('Could not find the place for the given Id.', 500));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(creator);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError('Could not delete place, please try again later!', 500));
  }
  res.status(200).json({ message: "Place Deleted!" });
};

/*///////////******** Exporting all functions. ********\\\\\\\\\\\\\ */

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;