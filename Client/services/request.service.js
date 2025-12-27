// Request Service
// src/services/request.service.js
import api from './api';

const requestService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/requests?${params}/`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  create: async (requestData) => {
    const response = await api.post('/requests/', requestData);
    return response.data;
  },

  update: async (id, requestData) => {
    const response = await api.put(`/requests/${id}`, requestData);
    return response.data;
  },

  assign: async (id, technicianId = null) => {
    const response = await api.put(`/requests/${id}/assign`, { technicianId });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/requests/${id}`);
    return response;
  }
};

export default requestService;