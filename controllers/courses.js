const AsyncHandler = require('../middlewares/async')
const Courses = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')

// @desc        Get all courses
// @route       GET / api/v1/courses
// @route       GET / api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = AsyncHandler(async (req, res, next) => {
    let query

    if (req.params.bootcampId) {
        const courses = await Courses.find({ bootcamp: req.params.bootcampId })

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        })
    } else {
        res.status(200).json(res.advanceResults)
    }
})

// @desc        Get single course
// @route       GET / api/v1/courses/:id
// @access      Public
exports.getCourse = AsyncHandler(async (req, res, next) => {
    const course = await Courses.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description',
    })

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }

    res.status(200).json({
        success: true,
        data: course,
    })
})

// @desc        Add course
// @route       POST / api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.addCourse = AsyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp with the id of ${req.params.bootcampId} not found`,
            ),
            404,
        )
    }

    const course = await Courses.create(req.body)

    res.status(200).json({
        success: true,
        data: course,
    })
})

// @desc        Update course
// @route       PUT / api/v1/courses/:id
// @access      Private
exports.updateCourse = AsyncHandler(async (req, res, next) => {
    const course = await Courses.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }

    res.status(200).json({
        success: true,
        data: course,
    })
})

// @desc        Delete course
// @route       DELETE / api/v1/courses/:id
// @access      Private
exports.deleteCourse = AsyncHandler(async (req, res, next) => {
    const course = await Courses.findById(req.params.id)

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }

    course.remove()

    res.status(200).json({
        success: true,
        data: {},
    })
})
