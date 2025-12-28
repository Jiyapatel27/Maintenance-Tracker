// models/Request.model.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: [true, 'Equipment is required']
  },
  type: {
    type: String,
    enum: ['corrective', 'preventive'],
    required: [true, 'Request type is required']
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'repaired', 'scrap'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  category: {
    type: String
  },
  scheduledDate: {
    type: Date,
    default: null
  },
  completedDate: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: null,
    comment: 'Duration in hours'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// ✅ FIXED: Auto-populate only on query operations
requestSchema.pre(/^find/, function() {
  // Remove 'next' parameter - not needed for query middleware
  this.populate('equipmentId', 'name serialNumber category')
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('teamId', 'name icon');
});

module.exports = mongoose.model('Request', requestSchema);