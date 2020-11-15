const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg'
};

const fileUpload = multer({
  limits: 1000000,
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'uploads/images');
    },
    filename: (req, file, callback) => {
      const ext = MIME_TYPE_MAP[file.mimetype] // extension of the incoming file.
      callback(null, uuidv4() + '.' + ext);
    }
  }),
  fileFilter: (req, file, callback) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; // !! it turns null or undefined to false and others to true 
    let error = isValid ? null : new Error('Invalid mime type !');
    callback(error, isValid);
  }
});

module.exports = fileUpload;

// mimetype tells us which kind of file we are dealing .
