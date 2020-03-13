const express = require('express')
const {
    getCourses,
    getCourse,
    addCourse,
    deleteCourse,
    updateCourse,
} = require('../controllers/courses')

const Course = require('../models/Course')
const advanceResults = require('../middlewares/advanceResults')
const { protect } = require('../middlewares/auth')

const router = express.Router({ mergeParams: true })

router
    .route('/')
    .get(
        advanceResults(Course, {
            path: 'bootcamp',
            select: 'name description',
        }),
        getCourses,
    )
    .post(protect, addCourse)
router
    .route('/:id')
    .get(getCourse)
    .delete(protect, deleteCourse)
    .put(protect, updateCourse)

module.exports = router
