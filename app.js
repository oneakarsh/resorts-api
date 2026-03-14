const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./src/middleware/errorMiddleware');
const { searchResorts } = require('./src/controllers/resort.controller');
const setupSwagger = require('./src/config/swagger');

// Route imports
const authRoutes = require('./src/routes/auth.routes.js');
const resortRoutes = require('./src/routes/resort.routes.js');
const bookingRoutes = require('./src/routes/booking.routes.js');
const reviewRoutes = require('./src/routes/review.routes.js');
const userRoutes = require('./src/routes/user.routes.js');
const roomRoutes = require('./src/routes/room.routes.js');
const adminRoutes = require('./src/routes/admin.routes.js');
const superAdminRoutes = require('./src/routes/superadmin.routes.js');
const analyticsRoutes = require('./src/routes/analytics.routes.js');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static Folder for image uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple logging in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resorts', resortRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/superadmin', superAdminRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// Search API (Special route)
app.get('/api/v1/search', searchResorts);

// Health check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            message: 'API is running',
            time: new Date()
        }
    });
});

// Swagger Documentation
setupSwagger(app);

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
