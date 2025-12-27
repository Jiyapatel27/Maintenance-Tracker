// Equipment Routes
// routes/equipment.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentRequests
} = require('../controllers/equipment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/roleCheck.middleware');

router.get('/', protect, getAllEquipment);
router.get('/:id', protect, getEquipmentById);
router.get('/:id/requests', protect, getEquipmentRequests);
router.post('/', protect, authorize('admin'), createEquipment);
router.put('/:id', protect, authorize('admin'), updateEquipment);
router.delete('/:id', protect, authorize('admin'), deleteEquipment);

module.exports = router;