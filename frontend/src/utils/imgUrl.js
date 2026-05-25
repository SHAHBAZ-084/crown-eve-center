// Resolves image/video URLs — R2 full URLs or legacy paths
import { getApiUrl } from './apiUrl';

const R2_PUBLIC = import.meta.env.VITE_R2_PUBLIC_URL?.replace(/\/$/, '');

export const getR2PublicBase = () => R2_PUBLIC || '';

export const getImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (R2_PUBLIC && url.startsWith('uploads/')) return `${R2_PUBLIC}/${url}`;
  const apiUrl = getApiUrl();
  const base = apiUrl.replace('/api', '');
  const pathPart = url.startsWith('/') ? url : `/${url}`;
  return `${base}${pathPart}`;
};

/** Same as getImgUrl — use for video src */
export const getMediaUrl = getImgUrl;
