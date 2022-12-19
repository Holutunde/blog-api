const express = require('express')
const router = express.Router()
const fileUpload = require('express-fileupload')

const { parseData } = require('../middleware/parseData')

const {
  createPost,
  deletePost,
  updatePost,
  getPost,
  getFeaturedPost,
  getLatestPosts,
} = require('../controllers/post')

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
router
  .route('/:id')
  .patch(
    fileUpload({ useTempFiles: true }),
    parseData,
    postValidator,
    validate,
    updatePost,
  )
router
  .route('/:id')
  .put(
    fileUpload({ useTempFiles: true }),
    parseData,
    postValidator,
    validate,
    updatePost,
  )
router.route('/:id').delete(deletePost)

router.route('/single/:slug').get(getPost)
router.route('/featured').get(getFeaturedPost)
router.route('/latestpost').get(getLatestPosts)

module.exports = router
