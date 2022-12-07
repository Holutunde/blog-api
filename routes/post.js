const express = require('express')
const router = express.Router()

const { parseData } = require('../middleware/parseData')

const { createPost } = require('../controllers/post')

const multer = require('../middleware/multer')
const { postValidator, validate } = require('../middleware/postValidator')

router
  .route('/create')
  .post(
    multer.single('thumbnail'),
    parseData,
    postValidator,
    validate,
    createPost,
  )

module.exports = router
