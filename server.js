const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const errorHandler = require('./middlewares/error')
const connectDB = require('./config/db')
const colors = require('colors')
const path = require('path')
const cookieParser = require('cookie-parser')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Connect to DB
connectDB()

// Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')

// App init
const app = express()

// File Upload
app.use(fileUpload())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Body parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Mount routes
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)

app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold,
    ),
)

// Handle unhandled promises rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold)
    server.close(() => {
        process.exit(1)
    })
})
