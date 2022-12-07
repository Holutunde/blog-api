require('dotenv').config()
require('express-async-errors')
// Note: You MUST import the package in some way for tracing to work
const fileUpload = require('express-fileupload')

const express = require('express')
const app = express()
const morgan = require('morgan')
const connectDB = require('./database/db')
const errorHandler = require('./middleware/errorHandler')
const notFound = require('./middleware/notFound')
const post = require('./routes/post')

app.use(morgan('dev'))
app.use(fileUpload())

const port = process.env.PORT || 4000

app.use('/blog', post)

app.get('/', (req, res) => {
  res.send('Welcome to Blog api')
})

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message })
})

app.use(errorHandler)
app.use(notFound)

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    )
  } catch (error) {
    console.log(error)
  }
}

start()
