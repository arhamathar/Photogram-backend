const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  resetToken: {
    type: String
  },
  resetTokenExpiration: {
    type: Date
  },
  image: {
    type: String,
    required: true
  },
  places: [{
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Place'
  }]
});

// unique increases the speed of query process

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);