import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';

/** Catalog reads without Authorization — enables server-side GET cache for all visitors. */
const publicApi = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

const RETRY_STATUSES = new Set([502, 503, 504]);
const RETRY_DELAY_MS = 1200;
const MAX_RETRIES = 2;

publicApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status;
    if (!config || !RETRY_STATUSES.has(status)) {
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
