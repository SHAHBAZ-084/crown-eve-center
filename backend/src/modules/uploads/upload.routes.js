// All website uploads (images + videos) → Cloudflare R2 only (no local disk).
const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadBuffer, deleteByUrl, assertR2Config } = require('../../../scripts/r2-upload');
const { protect } = require('../../middleware/auth');

const router = express.Router();

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)$/i;
const IMAGE_TYPES = /^image\//i;
const VIDEO_TYPES = /^video\//i;

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 80;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok =
      (IMAGE_TYPES.test(file.mimetype) && IMAGE_EXT.test(ext)) ||
      (VIDEO_TYPES.test(file.mimetype) && VIDEO_EXT.test(ext));
    if (!ok) {
      return cb(new Error('Allowed: images (jpg, png, webp, gif) and videos (mp4, webm, mov)'));
    }
    cb(null, true);
  },
});

const pickFile = (req) => {
  if (req.file) return req.file;
  const f = req.files || {};
  return f.image?.[0] || f.video?.[0] || f.file?.[0] || null;
};

const isVideoFile = (file) => VIDEO_TYPES.test(file.mimetype) || VIDEO_EXT.test(path.extname(file.originalname));

router.post(
  '/',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  async (req, res) => {
    const file = pickFile(req);
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded. Use field: image, video, or file.' });
    }

    const video = isVideoFile(file);
    const maxBytes = (video ? MAX_VIDEO_MB : MAX_IMAGE_MB) * 1024 * 1024;
    if (file.size > maxBytes) {
      return res.status(400).json({
        message: `File too large. Max ${video ? MAX_VIDEO_MB : MAX_IMAGE_MB} MB for ${video ? 'video' : 'image'}.`,
      });
    }

    try {
      assertR2Config();
      const ext = path.extname(file.originalname).toLowerCase() || (video ? '.mp4' : '.jpg');
      const folder = video ? 'uploads/videos' : 'uploads/images';
      const key = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const url = await uploadBuffer(key, file.buffer, file.mimetype);

      res.json({
        url,
        key,
        type: video ? 'video' : 'image',
        contentType: file.mimetype,
      });
    } catch (err) {
      console.error('R2 upload error:', err);
      res.status(500).json({ message: 'Upload failed', error: err.message });
    }
  }
);

router.delete('/', protect, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'url required' });

  try {
    await deleteByUrl(url);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
