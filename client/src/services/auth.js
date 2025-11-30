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

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getCaptcha() {
    const response = await api.get('/auth/captcha');
    return response.data;
  },

  async verifyToken() {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  async getAllUsers() {
    const response = await api.get('/users/all');
    return response.data;
  },

  async updateTheme(theme){
    const response = await api.patch('/users/theme', {theme});
    return response.data;
  }

};