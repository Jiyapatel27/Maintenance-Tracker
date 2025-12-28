// Equipment Model
// models/Equipment.model.js
const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Production', 'IT Equipment', 'Logistics', 'HVAC', 'Electrical', 'Other'],
    default: 'Other'
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  warranty: {
    type: Date
  },
  assignedEmployee: {
    type: String,
    default: null
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Maintenance team is required']
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Default technician is required']
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'repair', 'scrapped'],
    default: 'operational'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema);