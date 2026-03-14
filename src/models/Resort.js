const mongoose = require('mongoose');

const ResortSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a resort name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    location: {
        type: String,
        required: [true, 'Please provide a location']
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    amenities: {
        type: [String],
        default: []
    },
    images: {
        type: [String],
        default: ['default-resort.jpg']
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    latitude: {
      type: Number,
      default: 0,
    },
    longitude: {
      type: Number,
      default: 0,
    },
    pricePerNight: {
        type: Number,
        default: 0
    },
    maxGuests: {
        type: Number,
        default: 1
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        default: 4.5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Cascade delete rooms when a resort is deleted
ResortSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    console.log(`Rooms being removed from resort ${this._id}`);
    await this.model('Room').deleteMany({ resortId: this._id });
    next();
});

// Reverse populate with virtuals
ResortSchema.virtual('rooms', {
    ref: 'Room',
    localField: '_id',
    foreignField: 'resortId',
    justOne: false
});

module.exports = mongoose.model('Resort', ResortSchema);
