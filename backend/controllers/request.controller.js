// controllers/request.controller.js - FIXED VERSION
const Request = require('../models/Request.model');
const Equipment = require('../models/Equipment.model');

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
const getAllRequests = async (req, res) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === 'employee') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'technician') {
      query.$or = [
        { assignedTo: req.user._id },
        { status: 'new', teamId: req.user.teamId }
      ];
    }

    // Additional filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    if (req.query.priority) query.priority = req.query.priority;

    const requests = await Request.find(query).sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
  try {
    console.log('Creating request with data:', req.body);
    console.log('User:', req.user);

    // Validate required fields
    const { subject, equipmentId, type, priority } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject is required' 
      });
    }

    if (!equipmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Equipment is required' 
      });
    }

    if (!type || !['corrective', 'preventive'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid request type is required (corrective or preventive)' 
      });
    }

    // Auto-fill equipment info
    const equipment = await Equipment.findById(equipmentId)
      .populate('teamId')
      .populate('technicianId');
    
    if (!equipment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Equipment not found' 
      });
    }

    console.log('Found equipment:', equipment);

    // Prepare request data
    const requestData = {
      subject: subject.trim(),
      description: req.body.description?.trim() || '',
      equipmentId: equipment._id,
      type,
      priority: priority || 'medium',
      createdBy: req.user._id,
      teamId: equipment.teamId?._id || null,
      category: equipment.category,
      status: 'new'
    };

    // Add optional fields
    if (req.body.scheduledDate) {
      requestData.scheduledDate = req.body.scheduledDate;
    }

    if (req.body.assignedTo) {
      requestData.assignedTo = req.body.assignedTo;
    }

    console.log('Creating request with data:', requestData);

    const request = await Request.create(requestData);
    
    // Populate the created request before sending response
    const populatedRequest = await Request.findById(request._id);

    console.log('Request created successfully:', populatedRequest);

    res.status(201).json({ success: true, data: populatedRequest });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message,
      error: error.toString()
    });
  }
};

// @desc    Update request
// @route   PUT /api/requests/:id
// @access  Private
const updateRequest = async (req, res) => {
  try {
    console.log('Updating request:', req.params.id);
    console.log('Update data:', req.body);

    // If moving to repaired, set completed date
    if (req.body.status === 'repaired' && !req.body.completedDate) {
      req.body.completedDate = new Date();
    }

    // If moving to scrap, update equipment status
    if (req.body.status === 'scrap') {
      const request = await Request.findById(req.params.id);
      if (request && request.equipmentId) {
        await Equipment.findByIdAndUpdate(request.equipmentId, { 
          status: 'scrapped' 
        });
      }
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    console.log('Request updated successfully');

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Assign request to technician
// @route   PUT /api/requests/:id/assign
// @access  Private (Manager/Technician)
const assignRequest = async (req, res) => {
  try {
    const assignTo = req.body.technicianId || req.user._id;

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: assignTo,
        status: 'in-progress'
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Assign request error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private (Admin/Manager)
const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Request deleted successfully' 
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  assignRequest,
  deleteRequest
};