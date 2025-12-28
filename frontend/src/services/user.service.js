// User Service
// src/services/user.service.js
import api from './api';

const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },

  getTechniciansByTeam: async (teamId) => {
    const response = await api.get(`/users/technicians/${teamId}`);
    return response.data;
  }
};

export default userService;