import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';

const AUTH_TIMEOUT_MS = 15000;

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 60000,
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
  if (typeof config.url === 'string' && config.url.startsWith('/auth/')) {
    config.timeout = AUTH_TIMEOUT_MS;
  }
  return config;
});

// Response interceptor — auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.startsWith('/auth/')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      // Redirect to homepage silently (not /unauthorized)
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
