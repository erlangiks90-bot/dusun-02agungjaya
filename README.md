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


## Upgrade v8 REAL - Hybrid Offline + Online

Ini bukan dokumen saja. File nyata yang ditambahkan:
- public/manifest.json
- public/service-worker.js
- public/js/offline-db.js
- public/js/register-sw.js
- icon PWA
- cache offline halaman utama, login, app, CSS, JS
- IndexedDB lokal untuk warga, kk, surat, pengaduan, pengumuman, galeri, iuran
- sync_queue untuk data yang disimpan saat offline
- status Online/Offline/Sinkron di header aplikasi

Cara kerja:
- GET data akan disimpan ke IndexedDB.
- Jika offline, tabel tetap menampilkan cache IndexedDB.
- POST saat offline masuk antrean sync_queue.
- Saat online kembali, syncQueue mencoba mengirim ulang.

Catatan:
- Offline login bisa dipakai jika akun pernah login di perangkat itu.
- Upload foto besar tetap lebih aman saat online.
- Supabase Storage final masih perlu dipindahkan dari upload lokal.


## Upgrade v9 FAST + OCR KK

Fokus:
- Membuat aplikasi lebih cepat seperti Tecno POS.
- Halaman dipisah:
  /fast/kadus
  /fast/rt
  /fast/masyarakat
  /fast/warga
  /fast/kk
  /fast/surat
- Tidak lagi memuat satu app besar untuk semua modul.
- JS dipisah:
  fast-common.js
  warga-fast.js
  ocr-kk.js
- OCR KK nyata memakai tesseract.js:
  route: POST /api/ocr/kk
  service: services/ocrKK.js
- Upload/scanner KK:
  input file menggunakan capture="environment"
- Hasil OCR masuk preview form.
- Data OCR bisa diedit sebelum disimpan.
- Setelah klik Simpan ke Data Warga, anggota KK masuk ke tabel warga.
- Umur otomatis dihitung dari tanggal lahir pada tampilan warga.
- Akun RT otomatis wilayahnya sendiri:
  RT 06 hanya RT 06
  RT 07 hanya RT 07
  RT 08 hanya RT 08

Catatan:
OCR KK dari foto asli bisa tidak 100% akurat, jadi sistem sengaja menampilkan preview untuk dikoreksi dulu sebelum simpan.


## Upgrade v10 REAL

Perbaikan nyata:
- Backend `routes/warga.js` dikunci:
  - RT hanya melihat dan mengubah data RT miliknya.
  - Kadus bisa semua.
  - Masyarakat hanya data sendiri.
- Form RT otomatis RT login, tidak bisa pilih RT lain.
- Data warga lebih lengkap:
  tempat lahir, tanggal lahir, umur otomatis, agama, pendidikan, pekerjaan,
  status perkawinan, hubungan keluarga, golongan darah, no HP.
- Tambah route `routes/kk.js` untuk menyimpan data KK.
- OCR KK:
  - Scan foto KK dengan tesseract.js.
  - Preview hasil OCR.
  - Semua field bisa diedit dulu.
  - Simpan KK.
  - Simpan anggota otomatis ke tabel warga.
  - Jika NIK sudah ada, update data.
- Tabel warga menampilkan umur otomatis.
- Statistik warga cepat:
  warga, KK, laki/perempuan, balita/lansia.

Catatan:
OCR foto KK sangat tergantung kualitas foto. Sistem sengaja wajib preview dan edit sebelum simpan.

## Upgrade v11 REALISTIC
- Halaman baru: /fast/kk-realistic dan /fast/warga-realistic
- OCR KK dibuat realistis: scan -> preview -> edit -> simpan
- Ada confidence OCR dan raw text OCR
- Ada mode input manual jika OCR gagal
- Dashboard Kadus/RT diarahkan ke halaman realistis
