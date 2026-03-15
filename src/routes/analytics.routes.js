const express = require('express');
const { getResortAnalytics, exportResortData } = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('ResortOwner', 'Admin', 'SuperAdmin'));

router.get('/:id/analytics', getResortAnalytics);
router.get('/:id/export', exportResortData);

module.exports = router;
