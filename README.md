# SIDUS Dusun 02 Desa Agung Jaya - Upgrade v2

Versi ini meng-upgrade SIDUS v1:
- Tampilan website utama resmi
- Menu publik hamburger di HP
- Login tanpa menampilkan contoh password
- Dashboard Kadus/RT/Masyarakat kotak-kotak
- Klik menu membuka halaman baru, bukan tampil di bawah dashboard
- Data warga dengan cari/filter RT
- Data RT
- Iuran
- Surat Pengantar
- Pengaduan
- Pengaturan profil/running teks
- Supabase schema lebih lengkap

## Login demo fallback
Jika Supabase belum diisi:
- Kadus: kadus / admin123
- RT 06: rt06 / rt06123
- RT 07: rt07 / rt07123
- RT 08: rt08 / rt08123
- Warga: 1606010000000001 / warga123

Catatan: contoh login hanya ada di README, tidak tampil di halaman login.

## Jalankan lokal
npm install
npm start

## Deploy Railway
1. Upload ke GitHub repo dusun-02agungjaya
2. Railway Deploy from GitHub
3. Isi Variables:
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SESSION_SECRET
4. Jalankan supabase/schema.sql di SQL Editor Supabase

## Yang masih bisa dilanjutkan
- Upload Supabase Storage asli
- PDF surat resmi + TTD + QR
- OCR foto KK
- Export Excel/PDF
- PWA manifest


## Upgrade v3
- Menu Galeri Kadus
- Menu Pengumuman Kadus
- Placeholder OCR KK
- Statistik dashboard
- Struktur upload foto warga/KTP/KK
- Persiapan export laporan


## Upgrade v4
- Pengumuman sudah CRUD dasar
- Galeri sudah upload foto lokal dan tampil di website publik
- Upload foto warga/KTP/KK sudah disiapkan di form warga
- Upload logo, stempel, TTD Kadus disiapkan di pengaturan
- Halaman Data KK diberi placeholder OCR KK
- Website publik mengambil pengumuman dan galeri dari API
- Route upload memakai multer lokal. Untuk produksi dapat diganti ke Supabase Storage.

Catatan:
Upload v4 masih tersimpan di folder uploads Railway. Jika Railway redeploy, file lokal bisa hilang. Untuk produksi final, pindahkan upload ke Supabase Storage.
