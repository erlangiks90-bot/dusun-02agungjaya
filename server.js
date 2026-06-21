require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'sidus-rahasia-dusun02',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profil', require('./routes/profil'));
app.use('/api/rt', require('./routes/rt'));
app.use('/api/warga', require('./routes/warga'));
app.use('/api/kk', require('./routes/kk'));
app.use('/api/iuran', require('./routes/iuran'));
app.use('/api/pengaduan', require('./routes/pengaduan'));
app.use('/api/surat', require('./routes/surat'));
app.use('/api/pengumuman', require('./routes/pengumuman'));
app.use('/api/galeri', require('./routes/galeri'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ocr', require('./routes/ocr'));


app.get('/fast/kadus', (req,res) => res.sendFile(path.join(__dirname,'public/dashboard-kadus.html')));
app.get('/fast/rt', (req,res) => res.sendFile(path.join(__dirname,'public/dashboard-rt.html')));
app.get('/fast/masyarakat', (req,res) => res.sendFile(path.join(__dirname,'public/dashboard-masyarakat.html')));
app.get('/fast/warga', (req,res) => res.sendFile(path.join(__dirname,'public/warga.html')));
app.get('/fast/kk', (req,res) => res.sendFile(path.join(__dirname,'public/kk.html')));
app.get('/fast/surat', (req,res) => res.sendFile(path.join(__dirname,'public/surat.html')));

app.get('/health', (req, res) => res.json({ ok: true, app: 'SIDUS Dusun 02 Upgrade v2' }));

const pages = [
  '/dashboard-kadus','/dashboard-rt','/dashboard-masyarakat',
  '/kadus/warga','/kadus/kk','/kadus/rt','/kadus/iuran','/kadus/surat','/kadus/pengaduan','/kadus/pengumuman','/kadus/galeri','/kadus/laporan','/kadus/pengaturan',
  '/rt/warga','/rt/kk','/rt/iuran','/rt/surat','/rt/pengaduan','/rt/laporan','/rt/profil',
  '/masyarakat/data','/masyarakat/iuran','/masyarakat/surat','/masyarakat/pengaduan'
];

pages.forEach(route => app.get(route, (req,res) => res.sendFile(path.join(__dirname,'public/app.html'))));
app.get('*', (req,res) => res.sendFile(path.join(__dirname,'public/index.html')));

app.listen(PORT, () => console.log('SIDUS Upgrade berjalan di port ' + PORT));
