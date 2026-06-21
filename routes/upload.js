const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

const allowed = ['.jpg','.jpeg','.png','.webp'];
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder || 'lainnya';
    const dir = path.join(__dirname, '..', 'uploads', folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.round(Math.random()*999999) + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Format file harus JPG, JPEG, PNG, atau WEBP'));
    cb(null, true);
  }
});

router.post('/:folder', requireLogin, upload.single('foto'), (req, res) => {
  const folder = req.params.folder;
  res.json({
    ok: true,
    filename: req.file.filename,
    url: `/uploads/${folder}/${req.file.filename}`
  });
});

module.exports = router;
