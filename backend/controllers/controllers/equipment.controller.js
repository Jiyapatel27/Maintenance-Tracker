// Equipment Controller
// controllers/equipment.controller.js
const Equipment = require('../models/Equipment.model');
const Request = require('../models/Request.model');

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ isActive: true })
      .populate('teamId', 'name icon')
      .populate('technicianId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: equipment.length, data: equipment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('teamId', 'name icon')
      .populate('technicianId', 'name email avatar');

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    res.json({ success: true, data: equipment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create equipment
// @route   POST /api/equipment
// @access  Private (Admin only)
const createEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);
    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private (Admin only)
const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    res.json({ success: true, data: equipment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private (Admin only)
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    res.json({ success: true, message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get equipment maintenance history
// @route   GET /api/equipment/:id/requests
// @access  Private
const getEquipmentRequests = async (req, res) => {
  try {
    const requests = await Request.find({ equipmentId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentRequests
};