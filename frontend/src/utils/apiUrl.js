// Centralized API URL.
// Production site (crownevcenter.com / www) uses same-origin /api → Vercel proxies to Hostinger.
// Avoids CORS when www and api are different hosts; override with VITE_API_URL if needed.

export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  if (import.meta.env.MODE === 'production' && typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
};
