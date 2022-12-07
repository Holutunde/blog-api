// Require the cloudinary library
const cloudinary = require('cloudinary').v2

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: 'dsub8fyhz',
  api_key: '291317226865252',
  api_secret: 'DDKD8-6o71LlvdzgMsvmag5hxQ0',
  secure: true,
})

module.exports = cloudinary
