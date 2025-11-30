import axios from 'axios';

//const API_BASE_URL = 'http://localhost:5000/api';
const isDevelopment = import.meta.env.MODE === 'development';
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : '/api';  // Относительный путь через Apache


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Важно для сессий!
});


// Логирование ответов
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.message);
    
    if (error.response) {
      console.error('📊 Response data:', error.response.data);
      console.error('🔧 Response status:', error.response.status);
    } else if (error.request) {
      console.error('🌐 No response received:', error.request);
    }
    
    return Promise.reject(error);
  }
);

export default api;