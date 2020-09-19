// All the logic is in controllers folder.
const HttpError = require('../models/https-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

let DUMMY_PLACE = [
  {
    id: "p1",
    title: "Empire States Building",
    description: "One of the most famous building in the world.",
    location: {
      lat: "40",
      lng: "-70"
    },
    address: "New York",
    creator: "u1"
  }
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACE.find(p => {
    return p.id === placeId;
  });
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

function getPlacesByUserId(req, res, next) {
  const userId = req.params.uid;
  const place = DUMMY_PLACE.find(p => {
    return p.creator === userId;
  });
  if (!place) {
    return next(new HttpError('Could not find place for the provided user id .', 404));
    //next() is used in async js.
  }
  res.json({ place })
}

const createPlace = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid data entered, please enter valid data.", 422);

  }
  const { title, description, coordinates, address, creator } = req.body;
  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator
  };
  DUMMY_PLACE.push(createdPlace);
  res.status(201);
  res.json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatedPlace =
    DUMMY_PLACE.find(p => {
      return p.id === placeId;
    });
  const placeIndex = DUMMY_PLACE.indexOf(p => {
    return p.id === placeId;
  });
  updatedPlace.title = title;
  updatedPlace.description = description;
  DUMMY_PLACE[placeIndex] = updatedPlace;
  res.status(200).json({ place: updatedPlace });

};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  DUMMY_PLACE = DUMMY_PLACE.filter(p => {
    return p.id !== placeId;
  });
  res.status(200).json({ message: "Place Deleted!" })
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
