const dotenv = require('dotenv')
const fs = require('fs')
const colors = require('colors')
const connectDB = require('./config/db')

dotenv.config({ path: './config/config.env' })

connectDB()

const Bootcamp = require('./models/Bootcamp')
const Courses = require('./models/Course')

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))

const importData = async () => {
    try {
        await Bootcamp.create(bootcamps)
        // await Courses.create(courses)

        console.log('Data imported...'.green.inverse)
        process.exit()
    } catch (error) {
        console.log(error)
    }
}

const deleteData = async () => {
    try {
        await Bootcamp.deleteMany()
        await Courses.deleteMany()

        console.log('Data deleted...'.red.inverse)
        process.exit()
    } catch (error) {
        console.log(error)
    }
}

if (process.argv[2] === '-i') {
    importData()
} else if (process.argv[2] === '-d') {
    deleteData()
}
