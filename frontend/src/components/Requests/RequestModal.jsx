// src/components/Requests/RequestModal.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import requestService from '../../services/request.service';
import equipmentService from '../../services/equipment.service';
import userService from '../../services/user.service';
import toast from 'react-hot-toast';

const RequestModal = ({ request, onClose }) => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    equipmentId: '',
    type: 'corrective',
    priority: 'medium',
    scheduledDate: '',
    assignedTo: '',
    status: 'new',
    duration: ''
  });
  const [loading, setLoading] = useState(false);
  const [autoFilledTeam, setAutoFilledTeam] = useState(null);

  useEffect(() => {
    fetchEquipment();
    if (request) {
      setFormData({
        subject: request.subject || '',
        description: request.description || '',
        equipmentId: request.equipmentId?._id || '',
        type: request.type || 'corrective',
        priority: request.priority || 'medium',
        scheduledDate: request.scheduledDate ? request.scheduledDate.split('T')[0] : '',
        assignedTo: request.assignedTo?._id || '',
        status: request.status || 'new',
        duration: request.duration || ''
      });
      if (request.teamId?._id) {
        fetchTechniciansByTeam(request.teamId._id);
        setAutoFilledTeam({
          name: request.teamId?.name,
          icon: request.teamId?.icon,
          category: request.equipmentId?.category
        });
      }
    }
  }, [request]);

  const fetchEquipment = async () => {
    try {
      const data = await equipmentService.getAll();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
    }
  };

  const fetchTechniciansByTeam = async (teamId) => {
    try {
      const data = await userService.getTechniciansByTeam(teamId);
      setTechnicians(data);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const handleEquipmentChange = (equipmentId) => {
    const selectedEquipment = equipment.find(e => e._id === equipmentId);
    
    if (selectedEquipment) {
      setFormData({
        ...formData,
        equipmentId
      });
      
      // Auto-fill team info
      setAutoFilledTeam({
        name: selectedEquipment.teamId?.name,
        icon: selectedEquipment.teamId?.icon,
        category: selectedEquipment.category
      });

      // Fetch technicians for this team
      if (selectedEquipment.teamId?._id) {
        fetchTechniciansByTeam(selectedEquipment.teamId._id);
      }

      toast.success('Team and category auto-filled!');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.equipmentId) {
        toast.error('Please select an equipment');
        setLoading(false);
        return;
      }

      if (!formData.subject.trim()) {
        toast.error('Please enter a subject');
        setLoading(false);
        return;
      }

      // Prepare data to send
      const submitData = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        equipmentId: formData.equipmentId,
        type: formData.type,
        priority: formData.priority,
      };

      // Add optional fields only if they have values
      if (formData.scheduledDate) {
        submitData.scheduledDate = formData.scheduledDate;
      }

      if (formData.assignedTo) {
        submitData.assignedTo = formData.assignedTo;
      }

      if (formData.status && request) {
        submitData.status = formData.status;
      }

      if (formData.duration) {
        submitData.duration = parseFloat(formData.duration);
      }

      console.log('Submitting request data:', submitData);

      if (request) {
        await requestService.update(request._id, submitData);
        toast.success('Request updated successfully');
      } else {
        await requestService.create(submitData);
        toast.success('Request created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error?.message || error?.error || 'Operation failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'manager' || 
                  (request && request.createdBy?._id === user?._id);
  
  const canAssign = user?.role === 'manager' || user?.role === 'technician';
  const canUpdateStatus = user?.role === 'manager' || user?.role === 'technician';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {request ? 'Request Details' : 'Create Maintenance Request'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={!!request && !canEdit}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="corrective">🔧 Corrective (Breakdown)</option>
              <option value="preventive">🔁 Preventive (Routine)</option>
            </select>
          </div>

          {/* Equipment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment *
            </label>
            <select
              name="equipmentId"
              value={formData.equipmentId}
              onChange={(e) => handleEquipmentChange(e.target.value)}
              disabled={!!request && !canEdit}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="">Select Equipment</option>
              {equipment.map((eq) => (
                <option key={eq._id} value={eq._id}>
                  {eq.name} - {eq.category} ({eq.serialNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-filled Team Info */}
          {autoFilledTeam && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                ✅ Auto-filled Information:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">Team:</span>{' '}
                  <span className="font-semibold text-blue-900">
                    {autoFilledTeam.icon} {autoFilledTeam.name}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Category:</span>{' '}
                  <span className="font-semibold text-blue-900">{autoFilledTeam.category}</span>
                </div>
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              disabled={!!request && !canEdit}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe the issue..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!!request && !canEdit}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Provide additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={!!request && !canEdit}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            {/* Status (for editing) */}
            {request && canUpdateStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="repaired">Repaired</option>
                  <option value="scrap">Scrap</option>
                </select>
              </div>
            )}
          </div>

          {/* Scheduled Date (for preventive) */}
          {formData.type === 'preventive' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                disabled={!!request && !canEdit}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required={formData.type === 'preventive'}
              />
            </div>
          )}

          {/* Assign Technician */}
          {request && canAssign && technicians.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Technician
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {technicians.map((tech) => (
                  <option key={tech._id} value={tech._id}>
                    {tech.avatar} {tech.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Duration (for completed requests) */}
          {request && (formData.status === 'repaired' || request.status === 'repaired') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2.5"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {(!request || canEdit) && (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {request ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  request ? 'Update Request' : 'Create Request'
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              {request && !canEdit ? 'Close' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;