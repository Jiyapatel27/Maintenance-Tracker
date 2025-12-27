// Team Routes
// routes/team.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/team.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/roleCheck.middleware');

router.get('/', protect, getAllTeams);
router.get('/:id', protect, getTeamById);
router.post('/', protect, authorize('admin'), createTeam);
router.put('/:id', protect, authorize('admin'), updateTeam);
router.delete('/:id', protect, authorize('admin'), deleteTeam);

module.exports = router;