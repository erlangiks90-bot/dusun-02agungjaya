# SIDUS - Sistem Informasi Dusun

Aplikasi dusun versi awal untuk GitHub + Railway + Supabase.

## Login awal
- Kadus: `kadus` / `admin123`
- RT: `rt01` / `rt123`
- Masyarakat: `warga` / `warga123`

## Deploy Railway
1. Upload project ke GitHub.
2. Railway → New Project → Deploy from GitHub Repo.
3. Tambahkan Variables:
   - `JWT_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Jalankan SQL di Supabase dari file `supabase.sql`.

## Catatan
Kadus punya hak penuh. RT input warga, iuran, dan ajukan surat. Masyarakat lihat data sendiri, iuran, dan pengaduan.
