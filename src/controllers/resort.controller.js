const Resort = require('../models/Resort');
const { asyncHandler, sendResponse } = require('../utils/helpers');

// @desc    Get all resorts
// @route   GET /api/resorts
// @access  Public
exports.getResorts = asyncHandler(async (req, res, next) => {
    let query;

    // Create a copy of req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Resort.find(JSON.parse(queryStr)).populate('rooms');

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Resort.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const resorts = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    sendResponse(res, 200, true, 'Resorts fetched successfully', {
        count: resorts.length,
        pagination,
        data: resorts
    });
});

// @desc    Get single resort
// @route   GET /api/resorts/:id
// @access  Public
exports.getResort = asyncHandler(async (req, res, next) => {
    const resort = await Resort.findById(req.params.id).populate('rooms');

    if (!resort) {
        return sendResponse(res, 404, false, `Resort not found with id of ${req.params.id}`);
    }

    sendResponse(res, 200, true, 'Resort fetched successfully', { resort });
});

// @desc    Create new resort
// @route   POST /api/resorts
// @access  Private (ResortOwner, Admin)
exports.createResort = asyncHandler(async (req, res, next) => {
    // Add owner to body
    req.body.ownerId = req.user.id;

    // Handle images if uploaded
    if (req.files) {
        req.body.images = req.files.map(file => file.path);
    }

    const resort = await Resort.create(req.body);

    sendResponse(res, 201, true, 'Resort created successfully', { resort });
});

// @desc    Update resort
// @route   PUT /api/resorts/:id
// @access  Private (ResortOwner, Admin)
exports.updateResort = asyncHandler(async (req, res, next) => {
    let resort = await Resort.findById(req.params.id);

    if (!resort) {
        return sendResponse(res, 404, false, `Resort not found with id of ${req.params.id}`);
    }

    // Make sure user is resort owner or admin
    if (resort.ownerId.toString() !== req.user.id && req.user.role !== 'Admin') {
        return sendResponse(res, 401, false, `User is not authorized to update this resort`);
    }

    // Handle images if uploaded
    if (req.files && req.files.length > 0) {
        req.body.images = req.files.map(file => file.path);
    }

    resort = await Resort.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    sendResponse(res, 200, true, 'Resort updated successfully', { resort });
});

// @desc    Delete resort
// @route   DELETE /api/resorts/:id
// @access  Private (ResortOwner, Admin)
exports.deleteResort = asyncHandler(async (req, res, next) => {
    let resort = await Resort.findById(req.params.id);

    if (!resort) {
        return sendResponse(res, 404, false, `Resort not found with id of ${req.params.id}`);
    }

    // Make sure user is resort owner or admin
    if (resort.ownerId.toString() !== req.user.id && req.user.role !== 'Admin') {
        return sendResponse(res, 401, false, `User is not authorized to delete this resort`);
    }

    await resort.deleteOne();

    sendResponse(res, 200, true, 'Resort deleted successfully');
});

// @desc    Search API
// @route   GET /api/search
// @access  Public
exports.searchResorts = asyncHandler(async (req, res, next) => {
    const { location, guests, minPrice, maxPrice, amenities, rating } = req.query;

    let filter = {};

    if (location) {
        filter.location = { $regex: location, $options: 'i' };
    }

    if (amenities) {
        filter.amenities = { $all: amenities.split(',') };
    }

    if (rating) {
        filter.rating = { $gte: Number(rating) };
    }

    // This search combines resorts and price filters from rooms
    // In a production app, we'd use a more complex aggregation or search engine
    let resorts = await Resort.find(filter).populate({
        path: 'rooms',
        match: {
            pricePerNight: { $gte: minPrice || 0, $lte: maxPrice || Infinity },
            maxGuests: { $gte: guests || 1 }
        }
    });

    // Filter out resorts that don't have matching rooms
    resorts = resorts.filter(resort => resort.rooms.length > 0);

    sendResponse(res, 200, true, 'Search results fetched', { count: resorts.length, data: resorts });
});
