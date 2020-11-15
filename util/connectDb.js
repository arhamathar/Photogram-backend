const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
      });
    console.log("Database Connected.");
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = connectDB;