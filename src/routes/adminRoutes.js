const express = require('express');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { getAllBookings } = require('../controllers/bookingController');
const { authMiddleware, superadminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes here are restricted to Super Admin
router.use(authMiddleware);
router.use(superadminMiddleware);

// User Management (Includes Property Owners)
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Booking Management
router.get('/bookings', getAllBookings);

module.exports = router;
