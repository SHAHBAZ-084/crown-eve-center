// Resolves image/video URLs — prefers WebP images and WebM videos
import { getApiUrl } from './apiUrl';

const R2_PUBLIC = import.meta.env.VITE_R2_PUBLIC_URL?.replace(/\/$/, '');

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|bmp|tiff?)$/i;
const VIDEO_EXT_RE = /\.(mp4|mov|m4v|ogg)$/i;

export const getR2PublicBase = () => R2_PUBLIC || '';

/** Rewrite legacy image extensions to WebP (upload pipeline stores WebP). */
export const toWebpUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (/\.webp(\?|$)/i.test(url)) return url;
  return url.replace(IMAGE_EXT_RE, '.webp');
};

/** Rewrite legacy video extensions to WebM. */
export const toWebmUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (/\.webm(\?|$)/i.test(url)) return url;
  return url.replace(VIDEO_EXT_RE, '.webm');
};

/** Brand static images — R2 in prod, /public locally */
export const getPublicAssetUrl = (basename) => {
  const name = basename.replace(/\.(webp|png|jpg|jpeg|gif)$/i, '');
  if (R2_PUBLIC) return `${R2_PUBLIC}/${name}.webp`;
  return `/${name}.webp`;
};

/** Marketing / hero videos — WebM only */
export const getPublicVideoUrl = (basename) => {
  const name = basename.replace(/\.(webm|mp4|mov)$/i, '');
  if (R2_PUBLIC) return `${R2_PUBLIC}/videos/${name}.webm`;
  return `/videos/${name}.webm`;
};

export const getHeroBackgroundStyle = (basename, overlay = '0.55') => ({
  backgroundImage: `linear-gradient(rgba(0, 0, 0, ${overlay}), rgba(0, 0, 0, ${overlay})), url('${getPublicAssetUrl(basename)}')`,
});

export const getImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return toWebpUrl(url);
  }
  if (R2_PUBLIC && url.startsWith('uploads/')) {
    return toWebpUrl(`${R2_PUBLIC}/${url}`);
  }
  const apiUrl = getApiUrl();
  const base = apiUrl.replace('/api', '');
  const pathPart = url.startsWith('/') ? url : `/${url}`;
  return toWebpUrl(`${base}${pathPart}`);
};

/** Video src (catalog uploads, hero, etc.) */
export const getVideoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return toWebmUrl(url);
  }
  if (R2_PUBLIC && url.startsWith('uploads/')) {
    return toWebmUrl(`${R2_PUBLIC}/${url}`);
  }
  const apiUrl = getApiUrl();
  const base = apiUrl.replace('/api', '');
  const pathPart = url.startsWith('/') ? url : `/${url}`;
  return toWebmUrl(`${base}${pathPart}`);
};

/** @deprecated use getVideoUrl */
export const getMediaUrl = getVideoUrl;
