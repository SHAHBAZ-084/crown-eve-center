// frontend/src/utils/apiUrl.js
// Centralized API URL resolver to prevent hardcoded localhost fallbacks in production.

export const getApiUrl = () => {
  // 1. If VITE_API_URL is explicitly set via env variables, use it.
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. If in production mode, dynamically resolve or fall back to the live domain.
  if (import.meta.env.MODE === 'production') {
    if (typeof window !== 'undefined') {
      // If frontend and backend are hosted on the same domain (e.g. Hostinger public_html)
      if (window.location.hostname.includes('crownevecenter.com') || window.location.hostname.includes('crowneve.com')) {
        return `${window.location.origin}/api`;
      }
    }
    // Render backup fallback
    return 'https://crown-eve-center.onrender.com/api';
  }

  // 3. In development mode, fall back to localhost.
  return 'http://localhost:5000/api';
};
