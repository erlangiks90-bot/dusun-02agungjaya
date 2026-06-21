# SIDUS Dusun 02 Desa Agung Jaya

Source code v1 siap upload ke GitHub dan Railway.

## Login demo fallback
Jika Supabase belum disetel, aplikasi tetap bisa dicoba:
- Kadus: kadus / admin123
- RT 06: rt06 / rt06123
- RT 07: rt07 / rt07123
- RT 08: rt08 / rt08123
- Warga: 1606010000000001 / warga123

Username/password contoh tidak ditampilkan di halaman login.

## Jalankan lokal
```bash
npm install
npm start
```

## Deploy Railway
1. Upload semua file ke GitHub.
2. Railway -> New Project -> Deploy from GitHub.
3. Set variable SUPABASE_URL, SUPABASE_ANON_KEY, SESSION_SECRET.
4. Jalankan SQL di `supabase/schema.sql` pada Supabase SQL Editor.
