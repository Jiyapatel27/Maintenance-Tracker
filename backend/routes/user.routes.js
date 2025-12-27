// User Routes
// routes/user.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getTechniciansByTeam
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/roleCheck.middleware');

router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/technicians/:teamId', protect, getTechniciansByTeam);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;