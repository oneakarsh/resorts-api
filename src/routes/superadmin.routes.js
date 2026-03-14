const express = require('express');
const {
    getSuperAdminStats,
    getAllResorts,
    verifyResort,
    getAllUsers,
    updateUser
} = require('../controllers/superadmin.controller');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are protected and only for SuperAdmin
router.use(protect);
router.use(authorize('SuperAdmin'));

router.get('/stats', getSuperAdminStats);
router.get('/resorts', getAllResorts);
router.put('/resorts/:id/verify', verifyResort);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

module.exports = router;
