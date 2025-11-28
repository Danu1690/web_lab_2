import api from './api.js';

export const authAPI = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async getCaptcha() {
    const response = await api.get('/auth/captcha');
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  }
};