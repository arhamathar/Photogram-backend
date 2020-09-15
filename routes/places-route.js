const express = require('express');

const HttpError = require('../models/https-error');

const router = express.Router();

const DUMMY_PLACE = [
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

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACE.find(p => {
    return p.id === placeId;
  })
  // if (!place) {
  //   const error = new Error('Could not find place for the provided id.')
  //   error.code = 404;
  //   throw error; //throw  is used in sync js. 
  // }
  // *************   ERROR HANDLING USING MODELS   *************
  if (!place) {
    throw new HttpError('Could not find place for the provided id.', 404);
  }
  res.json({ place }); //{place: place} if key and value are equal;
})

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACE.find(p => {
    return p.creator === userId;
  });
  if (!place) {
    return next(new HttpError('Could not find place for the provided user id .', 404));
    //next() is used in async js.
  }
  res.json({ place })
})

module.exports = router;