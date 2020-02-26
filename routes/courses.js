const express = require('express')
const { getCourses, getCourse, addCourse, deleteCourse, updateCourse } = require('../controllers/courses')

const router = express.Router({ mergeParams: true })

router
    .route('/')
    .get(getCourses)
    .post(addCourse)
router
    .route('/:id')
    .get(getCourse)
    .delete(deleteCourse)
    .put(updateCourse)

module.exports = router
