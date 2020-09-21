const axios = require('axios');
const HttpError = require('../models/https-error');

const API_KEY = 'fbf3d58c6f7c7a';

const getCoordinates = async (address) => {
  const response = await axios.get(`https://us1.locationiq.com/v1/search.php?key=${API_KEY}&q=${address}&format=json`)
  // .then(response => {
  //   // if (!data || data.status === 'ZERO_RESULTS') {
  //   //   throw new HttpError('Could not find location for the specified address.', 422);
  //   // }
  //   console.log("______-------*********///////////");
  //   const coordinates = {
  //     lat: response.data[0].lat,
  //     lon: response.data[0].lon
  //   }
  //   console.log(coordinates.lat)
  //   console.log(coordinates.lon)
  //   return coordinates;
  // })
  // .catch(err => {
  //   console.log(err);
  // });
  console.log("______-------*********///////////");
  const coordinates = {
    lat: response.data[0].lat,
    lon: response.data[0].lon
  }
  console.log(coordinates.lat)
  console.log(coordinates.lon)
  return coordinates;

}

module.exports = getCoordinates;