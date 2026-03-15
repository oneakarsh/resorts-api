const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    resortId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resort',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a room type name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    pricePerNight: {
        type: Number,
        required: [true, 'Please provide a price per night']
    },
    maxGuests: {
        type: Number,
        required: [true, 'Please provide maximum guests']
    },
    images: {
        type: [String],
        default: ['default-room.jpg']
    },
    availability: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', RoomSchema);
