const axios = require('axios');
const HttpError = require('../models/https-error');


const getCoordinates = async (address) => {
  const response = await axios.get(`https://us1.locationiq.com/v1/search.php?key=${process.env.API_KEY}&q=${encodeURIComponent(address)}&format=json`)

  const data = response.data;
  if (!data) {
    return next(new HttpError('Could not find location for the specified address.', 422));
  }
  const coordinates = {
    lat: data[0].lat,
    lon: data[0].lon
  }
  return coordinates;
}

module.exports = getCoordinates;