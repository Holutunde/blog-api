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
  getAllPosts,
  search,
  relatedPost,
  uploadImage,
  getPostId,
} = require('../controllers/post')

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
  .route('/singleupload')
  .post(fileUpload({ useTempFiles: true }), uploadImage)
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
router.route('/getallpost').get(getAllPosts)
router.route('/single/:slug').get(getPost)
router.route('/detail/:id').get(getPostId)
router.route('/featured').get(getFeaturedPost)
router.route('/latestpost').get(getLatestPosts)
router.route('/search').get(search)
router.route('/relatedposts/:id').get(relatedPost)
router.route('/singleupload').post(uploadImage)

module.exports = router
