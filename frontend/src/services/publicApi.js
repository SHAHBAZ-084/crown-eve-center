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

export default publicApi;
