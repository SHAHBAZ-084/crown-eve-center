// frontend/src/utils/apiUrl.js
// Centralized API URL resolver to prevent hardcoded localhost fallbacks in production.

export const getApiUrl = () => {
  // 1. If VITE_API_URL is explicitly set via env variables, use it.
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. If in production mode, dynamically point to the origin we are loaded from
  if (import.meta.env.MODE === 'production') {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api`;
    }
  }

  // 3. In development mode, fall back to localhost.
  return 'http://localhost:5000/api';
};
