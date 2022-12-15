const multer = require('multer')

const storage = multer.diskStorage({})

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.includes('image')) {
    return cd('Invalid Image formate, false', false)
  }
  cb(null, true)
}

module.exports = multer({ storage, fileFilter })
