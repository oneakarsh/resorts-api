const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resortId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resort',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'At least 1 rating'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: [true, 'Please provide a comment'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate average rating for resort
ReviewSchema.statics.getAverageRating = async function (resortId) {
    const obj = await this.aggregate([
        {
            $match: { resortId: resortId }
        },
        {
            $group: {
                _id: '$resortId',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        if (obj[0]) {
            await this.model('Resort').findByIdAndUpdate(resortId, {
                rating: obj[0].averageRating.toFixed(1)
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.resortId);
});

// Call getAverageRating before remove
ReviewSchema.pre('deleteOne', { document: true, query: false }, function () {
    this.constructor.getAverageRating(this.resortId);
});

module.exports = mongoose.model('Review', ReviewSchema);
