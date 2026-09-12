import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Clean trailing slashes
rawUrl = rawUrl.replace(/\/+$/, '');
// Ensure it points to /api
if (!rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl}/api`;
}

const api = axios.create({
  baseURL: rawUrl
});

// Attach admin token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
