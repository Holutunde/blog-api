require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()
const morgan = require('morgan')
const connectDB = require('./database/db')
const errorHandler = require('./middleware/errorHandler')
const notFound = require('./middleware/notFound')

app.use(morgan('dev'))

app.use(errorHandler)
app.use(notFound)

const port = process.env.PORT || 4000

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
