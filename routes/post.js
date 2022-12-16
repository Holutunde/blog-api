const express = require('express')
const router = express.Router()
const fileUpload = require('express-fileupload')

const { parseData } = require('../middleware/parseData')

const { createPost, deletePost } = require('../controllers/post')

// const multer = require('../middleware/multer')
const { postValidator, validate } = require('../middleware/postValidator')

router
  .route('/create')
  .post(
    fileUpload({ useTempFiles: true }),
    parseData,
    postValidator,
    validate,
    createPost,
  )
router.route('/:id').delete(deletePost)

module.exports = router
