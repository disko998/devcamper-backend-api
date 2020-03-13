const ErrorResponse = require('../utils/errorResponse')
const AsyncHandler = require('../middlewares/async')
const Bootcamp = require('../models/Bootcamp')
const geocoder = require('../utils/geocoder')
const path = require('path')

// @desc        Get all bootcamps
// @route       GET / api/v1/bootcamps
// @access      Public
exports.getBootcamps = AsyncHandler(async (req, res, next) => {
    res.status(200).json(res.advanceResults)
})

// @desc        Get single bootcamp
// @route       GET / api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = AsyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
        )
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
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
        )
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
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
        )
    }

    bootcamp.remove()

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

// @desc        Upload bootcamp photo
// @route       PUT / api/v1/bootcamps/:id/photo
// @access      Private
exports.uploadBootcampPhoto = AsyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
        )
    }

    if (!req.files) {
        return next(new ErrorResponse(`File not found`, 400))
    }

    const photo = req.files.photo

    if (photo.size > process.env.MAX_FILE_SIZE) {
        return next(
            new ErrorResponse(
                `Photo is to big, max photo size is ${process.env.MAX_FILE_SIZE}`,
                400,
            ),
        )
    }

    if (!photo.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`File is not an image`, 400))
    }

    // Create custom file name
    photo.name = `photo_${bootcamp.id}${path.parse(photo.name).ext}`

    photo.mv(`${process.env.FILE_UPLOAD_PATH}/${photo.name}`, async err => {
        if (err) {
            console.log(err)
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: photo.name })
    })

    res.status(200).json({
        success: true,
        data: photo.name,
    })
})
