// User Controller
// controllers/user.controller.js
const User = require('../models/User.model');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .populate('teamId', 'name icon')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('teamId', 'name icon')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    // Don't allow password update through this route
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get technicians by team
// @route   GET /api/users/technicians/:teamId
// @access  Private
const getTechniciansByTeam = async (req, res) => {
  try {
    const technicians = await User.find({
      role: 'technician',
      teamId: req.params.teamId,
      isActive: true
    }).select('-password');

    res.json({ success: true, count: technicians.length, data: technicians });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getTechniciansByTeam
};