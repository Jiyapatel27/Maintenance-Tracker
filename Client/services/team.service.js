// Team Service
// src/services/team.service.js
import api from './api';

const teamService = {
  getAll: async () => {
    const response = await api.get('/teams');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  create: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  update: async (id, teamData) => {
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response;
  }
};

export default teamService;