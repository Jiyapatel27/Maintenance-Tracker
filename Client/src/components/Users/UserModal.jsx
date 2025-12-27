// User Model
// src/components/Users/UserModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import userService from '../../services/user.service';
import teamService from '../../services/team.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const UserModal = ({ user, onClose }) => {
  const { register } = useAuth();
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    avatar: '👤',
    teamId: ''
  });
  const [loading, setLoading] = useState(false);

  const avatars = ['👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧', '👨‍💻', '👩‍💻', '👤', '🧑‍💼', '🧑‍🔧'];

  useEffect(() => {
    fetchTeams();
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't pre-fill password for security
        role: user.role || 'employee',
        avatar: user.avatar || '👤',
        teamId: user.teamId?._id || ''
      });
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      const data = await teamService.getAll();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
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
      if (user) {
        // Update existing user
        const updateData = { ...formData };
        // Don't send password if it's empty
        if (!updateData.password) {
          delete updateData.password;
        }
        await userService.update(user._id, updateData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await register(formData);
        toast.success('User created successfully');
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
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
                required
                disabled={!!user} // Don't allow email change for existing users
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {user ? '' : '*'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={user ? 'Leave blank to keep current' : 'Min 6 characters'}
                required={!user}
                minLength={6}
              />
              {user && (
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to keep current password
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="employee">Employee</option>
                <option value="technician">Technician</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Team (only for technicians) */}
          {formData.role === 'technician' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Team *
              </label>
              <select
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.icon} {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {avatars.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar })}
                  className={`text-3xl p-3 rounded-lg border-2 transition-all ${
                    formData.avatar === avatar
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Role Description */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Role Permissions:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              {formData.role === 'admin' && (
                <>
                  <li>• Full system access</li>
                  <li>• Manage equipment, teams, and users</li>
                  <li>• View all reports and analytics</li>
                </>
              )}
              {formData.role === 'manager' && (
                <>
                  <li>• Create and assign maintenance requests</li>
                  <li>• View kanban board and calendar</li>
                  <li>• Manage team assignments</li>
                </>
              )}
              {formData.role === 'technician' && (
                <>
                  <li>• View and complete assigned tasks</li>
                  <li>• Update request status</li>
                  <li>• Record work duration</li>
                </>
              )}
              {formData.role === 'employee' && (
                <>
                  <li>• Create breakdown requests</li>
                  <li>• Track own request status</li>
                  <li>• View equipment information</li>
                </>
              )}
            </ul>
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
                  {user ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                user ? 'Update User' : 'Create User'
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

export default UserModal;