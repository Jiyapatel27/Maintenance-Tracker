// Request Routes
// routes/request.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  assignRequest,
  deleteRequest
} = require('../controllers/request.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/roleCheck.middleware');

router.get('/', protect, getAllRequests);
router.get('/:id', protect, getRequestById);
router.post('/', protect, createRequest);
router.put('/:id', protect, updateRequest);
router.put('/:id/assign', protect, authorize('manager', 'technician'), assignRequest);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteRequest);

module.exports = router;