const ErrorResponse = require('../utils/errorResponse')
const AsyncHandler = require('../middlewares/async')
const Bootcamp = require('../models/Bootcamp')
const geocoder = require('../utils/geocoder')

// @desc        Get all bootcamps
// @route       GET / api/v1/bootcamps
// @access      Public
exports.getBootcamps = AsyncHandler(async (req, res, next) => {
    let query

    const reqQuery = { ...req.query }

    const removeFields = ['select', 'sort', 'page', 'limit']

    removeFields.forEach(param => {
        delete reqQuery[param]
    })

    let queryString = JSON.stringify(reqQuery)

    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)/g, match => `$${match}`)

    query = Bootcamp.find(JSON.parse(queryString))

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Bootcamp.countDocuments()

    query.skip(startIndex).limit(limit)

    // Query database
    const bootcamps = await query

    // Pagination result
    const pagination = {}

    if (endIndex < total) {
        pagination.next = { page: page + 1, limit }
    }

    if (startIndex > 0) {
        pagination.prev = { page: page - 1, limit }
    }

    // Response
    res.status(200).json({
        success: true,
        pagination,
        count: bootcamps.length,
        data: bootcamps,
    })
})

// @desc        Get single bootcamp
// @route       GET / api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = AsyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: bootcamp,
    })
})

// @desc        Create new bootcamp
// @route       POST / api/v1/bootcamps
// @access      Private
exports.createBootcamp = AsyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body)
    res.status(200).json({
        success: true,
        data: bootcamp,
    })
})

// @desc        Update bootcamp
// @route       PUT / api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = AsyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: bootcamp,
    })
})

// @desc        Delete bootcamp
// @route       PUT / api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = AsyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: {},
    })
})

// @desc        Get bootcamps with in a radius
// @route       GET / api/v1/bootcamps/radius/:zipcode/:distance
// @access      Public
exports.getBootcampsInRadius = AsyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    const loc = await geocoder.geocode(zipcode)

    const lat = loc[0].latitude
    const lng = loc[0].longitude
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    })
})
