const express = require('express')
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
} = require('../controllers/bootcamps')

const coursesRouter = require('./courses')

const router = express.Router()

router.use('/:bootcampId/courses', coursesRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamp)

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp)

module.exports = router
