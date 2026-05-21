// backend/src/modules/uploads/upload.routes.js
// Uploads go to Cloudflare R2 (S3-compatible) — no local disk needed
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const router  = express.Router();
const { protect } = require('../../middleware/auth');

// ─── R2 Client ───────────────────────────────────────────────────────────────
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || process.env.R2_ENDPOINT_URL,         // e.g. https://<account>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY || process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_KEY || process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET      = process.env.R2_BUCKET_NAME;   // e.g. crown-eve-media
const PUBLIC_BASE = process.env.R2_PUBLIC_URL;    // e.g. https://media.crowneve.com  (R2 custom domain or pub URL)

// ─── Multer — memory storage, never touches disk ──────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
            && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only jpeg / jpg / png / webp allowed'));
  },
});

// ─── POST /api/upload ─────────────────────────────────────────────────────────
router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname)}`;

    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const url = `${PUBLIC_BASE}/${key}`;
    res.json({ url });
  } catch (err) {
    console.error('R2 upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// ─── DELETE /api/upload ───────────────────────────────────────────────────────
// Body: { url: "https://media.crowneve.com/uploads/xyz.jpg" }
router.delete('/', protect, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'url required' });

  try {
    // Extract key from full public URL
    const key = url.replace(`${PUBLIC_BASE}/`, '');
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
