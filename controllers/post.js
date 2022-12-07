const Post = require('../models/postSchema')
const FeaturedPost = require('../models/featuredSchema')
// Require the cloudinary library
const cloudinary = require('cloudinary').v2

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: 'dsub8fyhz',
  api_key: '291317226865252',
  api_secret: 'DDKD8-6o71LlvdzgMsvmag5hxQ0',
})

const addToFeaturedPosts = async (postID) => {
  const featuredPost = new FeaturedPost({ post: postID })
  await featuredPost.save()
  const featuredPosts = await FeaturedPost.find({}).sort({ createdAt: -1 })
  featuredPosts.forEach(async (post, index) => {
    if (index >= 4) await FeaturedPost.findByIdAndDelete(post._id)
  })
}

exports.createPost = async (req, res, next) => {
  res.send('olutunde')
}
