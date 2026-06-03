// Upload images/videos from the website → backend → Cloudflare R2
import { getApiUrl } from './apiUrl';

/**
 * @param {File} file
 * @param {{ field?: 'image'|'video'|'file' }} options
 * @returns {Promise<{ url: string, type: 'image'|'video' }>}
 */
export async function uploadMedia(file, options = {}) {
  if (!file) throw new Error('No file selected');

  const field = options.field || (file.type.startsWith('video/') ? 'video' : 'image');
  if (field === 'video' && file.type !== 'video/webm') {
    throw new Error('Videos must be WebM (.webm) format.');
  }
  const formData = new FormData();
  formData.append(field, file);

  const token = localStorage.getItem('token');
  const res = await fetch(`${getApiUrl()}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Upload failed (${res.status})`);
  }
  return { url: data.url, type: data.type || field };
}

export const uploadImage = (file) => uploadMedia(file, { field: 'image' });
export const uploadVideo = (file) => uploadMedia(file, { field: 'video' });
