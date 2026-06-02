import axios from 'axios';
import {
  getApiUrl,
  getApiFallbackUrl,
  isNetworkTransportError,
  setApiBasePreference,
} from '../utils/apiUrl';

/** Catalog reads without Authorization — enables server-side GET cache for all visitors. */
const publicApi = axios.create({
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

publicApi.interceptors.request.use((config) => {
  config.baseURL = getApiUrl();
  return config;
});

const RETRY_STATUSES = new Set([502, 503, 504]);
const RETRY_DELAY_MS = 1200;
const MAX_RETRIES = 2;

publicApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    if (!config.__apiFallback && isNetworkTransportError(error)) {
      const fallback = getApiFallbackUrl(config.baseURL || getApiUrl());
      if (fallback) {
        setApiBasePreference(fallback.includes('api.crownevcenter.com') ? 'direct' : 'proxy');
        config.__apiFallback = true;
        config.baseURL = fallback;
        try {
          return await publicApi.request(config);
        } catch (retryErr) {
          return Promise.reject(retryErr);
        }
      }
    }

    const status = error.response?.status;
    if (!RETRY_STATUSES.has(status)) {
      return Promise.reject(error);
    }
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= MAX_RETRIES) {
      return Promise.reject(error);
    }
    config.__retryCount += 1;
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * config.__retryCount));
    return publicApi(config);
  }
);

export default publicApi;
