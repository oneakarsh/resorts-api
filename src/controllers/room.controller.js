const Room = require('../models/Room');
const Resort = require('../models/Resort');
const { asyncHandler, sendResponse } = require('../utils/helpers');

// @desc    Get all rooms for a resort
// @route   GET /api/resorts/:id/rooms
// @access  Public
exports.getRoomsByResort = asyncHandler(async (req, res, next) => {
    const rooms = await Room.find({ resortId: req.params.id });

    sendResponse(res, 200, true, 'Rooms fetched successfully', { count: rooms.length, data: rooms });
});

// @desc    Create new room for a resort
// @route   POST /api/rooms
// @access  Private (ResortOwner, Admin)
exports.createRoom = asyncHandler(async (req, res, next) => {
    const { resortId } = req.body;

    const resort = await Resort.findById(resortId);
    if (!resort) {
        return sendResponse(res, 404, false, `Resort not found with id of ${resortId}`);
    }

    // Only owner of resort or admin can add rooms
    if (resort.ownerId.toString() !== req.user.id && req.user.role !== 'Admin') {
        return sendResponse(res, 401, false, `User is not authorized to add rooms to this resort`);
    }

    // Handle images if uploaded
    if (req.files) {
        req.body.images = req.files.map(file => file.path);
    }

    const room = await Room.create(req.body);

    sendResponse(res, 201, true, 'Room added successfully', { room });
});

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (ResortOwner, Admin)
exports.updateRoom = asyncHandler(async (req, res, next) => {
    let room = await Room.findById(req.params.id);

    if (!room) {
        return sendResponse(res, 404, false, `Room not found with id of ${req.params.id}`);
    }

    const resort = await Resort.findById(room.resortId);

    // Only owner of resort or admin can update rooms
    if (resort.ownerId.toString() !== req.user.id && req.user.role !== 'Admin') {
        return sendResponse(res, 401, false, `User is not authorized to update this room`);
    }

    // Handle images if uploaded
    if (req.files && req.files.length > 0) {
        req.body.images = req.files.map(file => file.path);
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    sendResponse(res, 200, true, 'Room updated successfully', { room });
});

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (ResortOwner, Admin)
exports.deleteRoom = asyncHandler(async (req, res, next) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        return sendResponse(res, 404, false, `Room not found with id of ${req.params.id}`);
    }

    const resort = await Resort.findById(room.resortId);

    // Only owner of resort or admin can update rooms
    if (resort.ownerId.toString() !== req.user.id && req.user.role !== 'Admin') {
        return sendResponse(res, 401, false, `User is not authorized to delete this room`);
    }

    await room.deleteOne();

    sendResponse(res, 200, true, 'Room deleted successfully');
});
