// Centralized API URL.
// Default: Hostinger API directly. On QUIC/network failures, fall back to www → Vercel proxy.

export const DIRECT_API = 'https://api.crownevcenter.com/api';
const STORAGE_KEY = 'crown_api_base';

export const getProxiedApiUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return DIRECT_API;
};

export const setApiBasePreference = (mode) => {
  if (typeof window === 'undefined') return;
  if (mode === 'proxy' || mode === 'direct') {
    sessionStorage.setItem(STORAGE_KEY, mode);
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
};

export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  if (import.meta.env.MODE === 'production' && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'crownevcenter.com' || host === 'www.crownevcenter.com') {
      const pref = sessionStorage.getItem(STORAGE_KEY);
      if (pref === 'proxy') return getProxiedApiUrl();
      return DIRECT_API;
    }
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
};

/** True when the browser never got an HTTP response (QUIC timeout, DNS, offline, etc.). */
export const isNetworkTransportError = (err) => {
  if (!err || err.response) return false;
  const msg = `${err.message || ''} ${err.code || ''}`;
  return (
    err.code === 'ERR_NETWORK' ||
    err.code === 'ECONNABORTED' ||
    err.code === 'ETIMEDOUT' ||
    /QUIC|NETWORK_IDLE|Failed to fetch|Network Error/i.test(msg)
  );
};

export const getApiFallbackUrl = (currentBase) => {
  if (!currentBase || typeof window === 'undefined') return null;
  if (currentBase.includes('api.crownevcenter.com')) {
    return getProxiedApiUrl();
  }
  if (window.location.hostname === 'crownevcenter.com' || window.location.hostname === 'www.crownevcenter.com') {
    return DIRECT_API;
  }
  return null;
};
