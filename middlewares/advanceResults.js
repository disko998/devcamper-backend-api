const advanceResults = (model, populate) => async (req, res, next) => {
    let query

    const reqQuery = { ...req.query }

    const removeFields = ['select', 'sort', 'page', 'limit']

    removeFields.forEach(param => {
        delete reqQuery[param]
    })

    let queryString = JSON.stringify(reqQuery)

    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)/g, match => `$${match}`)

    // Finding resource
    query = model.find(JSON.parse(queryString))

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
    const total = await model.countDocuments()

    query = query.skip(startIndex).limit(limit)

    if (populate) {
        query = query.populate(populate)
    }

    // Query database
    const results = await query

    // Pagination result
    const pagination = {}

    if (endIndex < total) {
        pagination.next = { page: page + 1, limit }
    }

    if (startIndex > 0) {
        pagination.prev = { page: page - 1, limit }
    }

    res.advanceResults = {
        success: true,
        count: results.length,
        pagination,
        data: results,
    }

    next()
}

module.exports = advanceResults
