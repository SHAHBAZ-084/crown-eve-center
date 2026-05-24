// Centralized API URL — production uses Hostinger API directly (avoids Vercel proxy 429s).

const PRODUCTION_API = 'https://api.crownevcenter.com/api';

export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  if (import.meta.env.MODE === 'production' && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'crownevcenter.com' || host === 'www.crownevcenter.com') {
      return PRODUCTION_API;
    }
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
};
