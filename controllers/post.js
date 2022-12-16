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

const removeFeaturedPosts = async (postID) => {
  if (!isValidObjectId(postID))
    return res.status(401).json({ error: 'Invalid request' })

  const post = postID
  await FeaturedPost.findByIdAndDelete({ post })
}
const addToFeaturedPosts = async (postID) => {
  const featuredPost = new FeaturedPost({ post: postID })
  await featuredPost.save()
  const featuredPosts = await FeaturedPost.find({}).sort({ createdAt: -1 })
  featuredPosts.forEach(async (post, index) => {
    if (index >= 4) await FeaturedPost.findByIdAndDelete(post._id)
  })
}

const isFeaturedPost = async (postID) => {
  const post = await FeaturedPost.findOne({ post: postID })
  return post ? true : false
}

exports.createPost = async (req, res, next) => {
  const { title, meta, content, slug, author, tags, featured } = req.body

  const thumbnail = req.files?.thumbnail

  console.log(thumbnail)

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
  const { id } = req.params

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

  await Post.findByIdAndDelete(post._id)
  await removeFeaturedPosts(post._id)
  return res.status(200).json('Post removed successfully')
}
exports.getPost = async (req, res) => {
  const id = req.params.id
  if (!isValidObjectId(id))
    return res.status(401).json({ error: 'Invalid request' })

  const post = await Post.findById(id)
  if (!post) return res.status(404).json({ error: 'Post not found' })

  const featured = await isFeaturedPost(post._id)

  const { title, meta, content, slug, author, tags } = post
  res.json({
    post: {
      id: post._id,
      title,
      meta,
      slug,
      content,
      tags,
      thumbnail: post.thumbnail?.secure_url,
      author,
      featured,
    },
  })
}

exports.updatePost = async (req, res, next) => {
  const { title, meta, content, slug, author, tags, featured } = req.body

  const thumbnail = req.files?.thumbnail

  const id = req.params.id

  if (!isValidObjectId(id))
    return res.status(401).json({ error: 'Invalid request' })

  const post = await Post.findById(id)
  if (!post) return res.status(404).json({ error: 'Post not found' })

  const public_id = post.thumbnail?.public_id

  if (thumbnail) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      thumbnail.tempFilePath,
    )

    post.thumbnail = { secure_url, public_id }
  }

  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id)
    if (result !== 'ok')
      return res.status(404).json({ error: 'Could not remove thumbnail' })
  }
  post.title = title
  post.meta = meta
  post.content = content
  post.author = author
  post.tags = tags

  if (featured) {
    await addToFeaturedPosts(post._id)
  } else {
    await removeFeaturedPosts(post._id)
  }

  await post.save()
  res.json({
    post: {
      id: post._id,
      title,
      meta,
      slug,
      content,
      tags,
      thumbnail: post.thumbnail?.secure_url,
      author: post.author,
    },
  })
}

exports.createPost = async (req, res, next) => {
  const { title, meta, content, slug, author, tags, featured } = req.body

  const thumbnail = req.files?.thumbnail

  console.log(thumbnail)

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

exports.getFeaturedPost = async (req, res) => {
  const featuredPosts = await FeaturedPost.find({})
    .sort({ createdAt: -1 })
    .limit(4)
    .populate({
      path: 'post',
      // select: ['_id', 'title', 'meta', 'slug', 'content', 'author'],
    })
  res.json({
    featuredPosts,
  })
}
