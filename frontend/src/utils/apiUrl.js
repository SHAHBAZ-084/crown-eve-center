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
    const pref = sessionStorage.getItem(STORAGE_KEY);
    if (pref === 'proxy') return getProxiedApiUrl();
    if (pref === 'direct') return DIRECT_API;
    const host = window.location.hostname;
    if (host === 'crownevcenter.com' || host === 'www.crownevcenter.com') {
      return DIRECT_API;
    }
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
};

/** Vercel SPA catch-all can return index.html (200) or 405 for /api — not the real backend. */
export const isMisroutedProxyResponse = (response, config) => {
  if (!config?.baseURL || typeof window === 'undefined') return false;
  const originApi = `${window.location.origin}/api`;
  if (!config.baseURL.startsWith(originApi)) return false;
  if (response?.status === 405) return true;
  const ct = response?.headers?.['content-type'] || '';
  return ct.includes('text/html');
};

export const shouldRetryViaDirectApi = (error, config) => {
  if (!config || config.__apiFallback) return false;
  if (isNetworkTransportError(error)) return true;
  const res = error?.response;
  if (res && isMisroutedProxyResponse(res, config)) return true;
  return false;
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
