import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.method === 'get') {
    config.headers['Cache-Control'] = 'max-age=60';
  }
  return config;
});

export default api;
