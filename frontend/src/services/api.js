import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to attach JWT token when authenticated
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('volttrade_jwt_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
