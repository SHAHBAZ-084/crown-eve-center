// frontend/src/utils/imgUrl.js
// Resolves image URLs — handles both old local paths and new R2 full URLs
import { getApiUrl } from './apiUrl';

export const getImgUrl = (url) => {
  if (!url) return '';
  // Already a full URL (R2 or any CDN) — return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Legacy local path like /uploads/filename.jpg
  // Point to backend base for old records until they are re-uploaded
  const apiUrl = getApiUrl();
  const base = apiUrl.replace('/api', '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};
