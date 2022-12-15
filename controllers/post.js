const Post = require('../models/postSchema')
const FeaturedPost = require('../models/featuredSchema')
const { isValidObjectId } = require('mongoose')
// Require the cloudinary library
const cloudinary = require('cloudinary').v2

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

const addToFeaturedPosts = async (postID) => {
  const isPostExisting = await Post.find({ post: postID })
  if (isPostExisting) return
  const featuredPost = new FeaturedPost({ post: postID })
  await featuredPost.save()
  const featuredPosts = await FeaturedPost.find({}).sort({ createdAt: -1 })
  featuredPosts.forEach(async (post, index) => {
    if (index >= 4) await FeaturedPost.findByIdAndDelete(post._id)
  })
}

exports.createPost = async (req, res, next) => {
  const { title, meta, content, slug, author, tags, featured } = req.body

  const thumbnail = req.files.thumbnail

  const isSlugExisting = await Post.findOne({ slug })

  if (isSlugExisting) {
    return res.status(401).json({ error: 'use unique slug' })
  }

  const newPost = new Post({ title, meta, content, slug, author, tags })

  if (thumbnail) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      thumbnail.tempFilePath,
    )

    newPost.thumbnail = { secure_url, public_id }
  }
  await newPost.save()

  if (featured) await addToFeaturedPosts(newPost._id)
  res.json({
    post: {
      id: newPost._id,
      title,
      meta,
      slug,
      content,
      thumbnail: newPost.thumbnail?.secure_url,
      author: newPost.author,
    },
  })
}
exports.deletePost = async (req, res, next) => {
  const id = req.params.id
  if (!isValidObjectId(id))
    return res.status(401).json({ error: 'Invalid request' })

  const post = await Post.findById(id)
  if (!post) return res.status(404).json({ error: 'Post not found' })

  const public_id = post.thumbnail?.public_id
  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id)
    if (result !== 'ok')
      return res.status(404).json({ error: 'Could not remove thumbnail' })
  }

  await Post.findByIdAndDelete(id)
  return res.status(200).json({ error: 'Post removed successfully' })
}
