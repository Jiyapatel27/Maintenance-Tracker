// Team Model
// src/components/Teams/TeamModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import teamService from '../../services/team.service';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TeamModal = ({ team, onClose }) => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    icon: '⚙️',
    description: '',
    members: []
  });
  const [loading, setLoading] = useState(false);

  const teamIcons = ['⚙️', '⚡', '💻', '🔧', '🛠️', '🏭', '🔌', '🖥️', '📱', '🚗'];

  useEffect(() => {
    fetchUsers();
    if (team) {
      setFormData({
        name: team.name || '',
        icon: team.icon || '⚙️',
        description: team.description || '',
        members: team.members?.map(m => m._id) || []
      });
    }
  }, [team]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      // Filter only technicians
      const technicians = response.data.filter(u => u.role === 'technician');
      setUsers(technicians);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMemberToggle = (userId) => {
    setFormData({
      ...formData,
      members: formData.members.includes(userId)
        ? formData.members.filter(id => id !== userId)
        : [...formData.members, userId]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (team) {
        await teamService.update(team._id, formData);
        toast.success('Team updated successfully');
      } else {
        await teamService.create(formData);
        toast.success('Team created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {team ? 'Edit Team' : 'Create Team'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Mechanics, Electricians"
              required
            />
          </div>

          {/* Team Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Icon *
            </label>
            <div className="flex flex-wrap gap-2">
              {teamIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`text-3xl p-3 rounded-lg border-2 transition-all ${
                    formData.icon === icon
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
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
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of team responsibilities..."
            />
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members (Technicians)
            </label>
            
            {users.length > 0 ? (
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                {users.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.members.includes(user._id)}
                      onChange={() => handleMemberToggle(user._id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-2xl">{user.avatar}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">
                  No technicians available. Create technician users first.
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Selected: {formData.members.length} member(s)
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {team ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                team ? 'Update Team' : 'Create Team'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;