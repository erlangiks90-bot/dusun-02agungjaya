const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireLogin } = require('../middleware/auth');
const { scanKK } = require('../services/ocrKK');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'ocr');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'kk-' + Date.now() + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 7 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/image\/(jpeg|jpg|png|webp)/i.test(file.mimetype)) {
      return cb(new Error('File harus gambar JPG/PNG/WEBP'));
    }
    cb(null, true);
  }
});

router.post('/kk', requireLogin, upload.single('foto_kk'), async (req, res) => {
  try {
    const parsed = await scanKK(req.file.path);
    parsed.foto_kk_url = '/uploads/ocr/' + req.file.filename;

    if (req.session.user.role === 'rt') {
      parsed.rt = req.session.user.rt;
    }

    res.json({ ok: true, data: parsed });
  } catch (e) {
    res.status(500).json({ error: 'OCR gagal: ' + e.message });
  }
});

module.exports = router;
