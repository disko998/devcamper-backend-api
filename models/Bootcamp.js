const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            unique: true,
            trim: true,
            maxlength: [50, 'Name can not be longer then 50 characters'],
        },
        slug: String,
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description can not be longer then 500 characters'],
        },
        website: {
            type: String,
            match: [
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                'Please use valid url',
            ],
        },
        phone: {
            type: String,
            maxlength: [20, 'Phone number can not be longer then 20 characters'],
        },
        email: {
            type: String,
            match: [
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please enter valid email',
            ],
        },
        address: {
            type: String,
            required: [true, 'Please add an address'],
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: false,
            },
            coordinates: {
                type: [Number],
                required: false,
                index: '2dsphere',
            },
            formatedAddress: String,
            street: String,
            city: String,
            state: String,
            zipcode: String,
            country: String,
        },
        careers: {
            type: [String],
            required: true,
            enum: ['Web Development', 'Mobile Development', 'UI/UX', 'Data Science', 'Business', 'Other'],
        },
        averageRating: Number,
        photo: {
            type: String,
            default: 'no-photo.jpg',
        },
        housing: {
            type: Boolean,
            default: false,
        },
        jobAssistance: {
            type: Boolean,
            default: false,
        },
        jobGuarantee: {
            type: Boolean,
            default: false,
        },
        acceptGi: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        averageCost: Number,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Delete courses
BootcampSchema.pre('remove', async function(next) {
    await this.model('Course').deleteMany({ bootcamp: this._id })
    next()
})

// Create bootcamp slug from name
BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

// Create geolocation from address
BootcampSchema.pre('save', async function(next) {
    try {
        const loc = await geocoder.geocode(this.address)

        this.location = {
            type: 'Point',
            coordinates: [loc[0].longitude, loc[0].latitude],
            formatedAddress: loc[0].formattedAddress,
            street: loc[0].streetName,
            city: loc[0].city,
            state: loc[0].state,
            zipcode: loc[0].zipcode,
            country: loc[0].country,
        }

        // Do not save address in DB
        this.address = undefined

        next()
    } catch (error) {
        next(error)
    }
})

// Reverse populate with schema
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false,
})

module.exports = mongoose.model('Bootcamp', BootcampSchema)
