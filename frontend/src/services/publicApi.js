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

    return Promise.reject(error);
  }
);

export default publicApi;
