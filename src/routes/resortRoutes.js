const express = require('express');
const {
  getAllResorts,
  getResortById,
  createResort,
  updateResort,
  deleteResort,
} = require('../controllers/resortController');
const { authMiddleware, propertyOwnerMiddleware, permissionMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllResorts);
router.get('/:id', getResortById);
router.post('/', authMiddleware, propertyOwnerMiddleware, permissionMiddleware('create_resort'), createResort);
router.put('/:id', authMiddleware, propertyOwnerMiddleware, permissionMiddleware('update_resort'), updateResort);
router.delete('/:id', authMiddleware, propertyOwnerMiddleware, permissionMiddleware('delete_resort'), deleteResort);

module.exports = router;
