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
  await FeaturedPost.findOneAndDelete({ post: postID })
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

//create Post
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

//delete Post
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

//get Post
exports.getPost = async (req, res) => {
  const { slug } = req.params
  if (!slug) return res.status(401).json({ error: 'Invalid request' })

  const post = await Post.findOne({ slug })
  if (!post) return res.status(404).json({ error: 'Post not found' })

  const featured = await isFeaturedPost(post._id)

  const { title, meta, content, author, tags } = post
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

//update Post
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
  // post.title = title
  // post.meta = meta
  // post.content = content
  // post.author = author
  // post.tags = tags

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

//get Featured Post
exports.getFeaturedPost = async (req, res) => {
  const featuredPosts = await FeaturedPost.find({})
    .sort({ createdAdt: -1 })
    .limit(4)
    .populate({
      path: 'post',
    })

  console.log(featuredPosts)
  res.status(200).json({
    posts: featuredPosts.map((post) => ({
      id: post._id,
      title: post.post.title,
      meta: post.post.meta,
      slug: post.post.slug,
      thumbnail: post.post.thumbnail?.secure_url,
      author: post.post.author,
    })),
  })
}

//get Latest Post
exports.getLatestPosts = async (req, res) => {
  const { pageNo, limit } = req.query
  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(limit)

  res.status(200).json({
    posts: posts.map((post) => ({
      id: post._id,
      title: post.title,
      meta: post.meta,
      slug: post.slug,
      thumbnail: post.thumbnail?.secure_url,
      author: post.author,
    })),
  })
}

//get All Posts
exports.getAllPosts = async (req, res) => {
  const post = await Post.find({})
  if (!post) return res.status(404).json({ error: 'Post not found' })

  res.status(200).json({ post })
}

//get Search
exports.search = async (req, res) => {
  const { title } = req.query

  if (!title.trim()) {
    return res.status(401).json({ error: 'search query is missing' })
  }

  const posts = await Post.find({ title: { $regex: title, $options: 'i' } })

  res.status(200).json({
    posts: posts.map((post) => ({
      id: post._id,
      title: post.title,
      meta: post.meta,
      slug: post.slug,
      thumbnail: post.thumbnail?.secure_url,
      author: post.author,
    })),
  })
}

//get Related Post
exports.relatedPost = async (req, res) => {
  const { id } = req.params

  if (!isValidObjectId(id))
    return res.status(401).json({ error: 'Invalid request' })

  const post = await Post.findById(id)
  if (!post) return res.status(404).json({ error: 'Post not found' })

  const relatedPosts = await Post.find({
    tags: { $in: [...post.tags] },
    _id: { $ne: post._id },
  })
    .sort({ createdAt: -1 })
    .limit(5)

  res.status(200).json({
    posts: relatedPosts.map((post) => ({
      id: post._id,
      title: post.title,
      tags: post.tags,
      meta: post.meta,
      slug: post.slug,
      thumbnail: post.thumbnail?.secure_url,
      author: post.author,
    })),
  })
}

//upload Image
exports.uploadImage = async (req, res) => {
  const file = req.files?.file
  if (!file) {
    return res.status(401).json({ error: 'Image file is missing!' })
  }
  if (file) {
    const { secure_url } = await cloudinary.uploader.upload(file.tempFilePath)
    res.status(201).json({ image: secure_url })
  }
}
