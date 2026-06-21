create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nik text unique,
  username text unique,
  password_hash text not null,
  role text not null check (role in ('kadus','rt','masyarakat')),
  rt text,
  no_hp text,
  aktif boolean default true,
  created_at timestamptz default now()
);

create table if not exists profil_dusun (
  id int primary key default 1,
  nama_dusun text default 'Dusun 02',
  desa text default 'Agung Jaya',
  kecamatan text default 'Lalan',
  kabupaten text default 'Musi Banyuasin',
  provinsi text default 'Sumatera Selatan',
  kadus text default 'Erlang Saputra',
  luas_wilayah text default 'Belum diisi',
  jumlah_penduduk int default 110,
  jumlah_kk int default 35,
  running_teks text default 'Selamat datang di Website Resmi Dusun 02 Desa Agung Jaya Kecamatan Lalan Kabupaten Musi Banyuasin.',
  logo_url text,
  banner_url text,
  stempel_url text,
  ttd_kadus_url text,
  whatsapp text,
  updated_at timestamptz default now()
);

create table if not exists rt (
  id bigserial primary key,
  nomor_rt text unique not null,
  nama_ketua text,
  no_hp text,
  ttd_url text,
  aktif boolean default true
);

create table if not exists kk (
  id bigserial primary key,
  no_kk text unique not null,
  kepala_keluarga text,
  alamat text,
  rt text,
  foto_kk_url text,
  created_at timestamptz default now()
);

create table if not exists warga (
  id bigserial primary key,
  nik text unique not null,
  no_kk text,
  nama text not null,
  tempat_lahir text,
  tanggal_lahir date,
  jenis_kelamin text,
  agama text,
  pendidikan text,
  pekerjaan text,
  status_perkawinan text,
  hubungan_keluarga text,
  alamat text,
  rt text not null,
  no_hp text,
  status text default 'Aktif',
  foto_url text,
  ktp_url text,
  kk_url text,
  created_at timestamptz default now()
);

create table if not exists iuran (
  id bigserial primary key,
  nama_iuran text not null,
  nominal numeric default 0,
  periode text default 'bulanan',
  rt_berlaku text default 'semua',
  aktif boolean default true,
  created_at timestamptz default now()
);

create table if not exists pembayaran_iuran (
  id bigserial primary key,
  warga_id bigint references warga(id) on delete set null,
  iuran_id bigint references iuran(id) on delete set null,
  bulan int,
  tahun int,
  nominal numeric default 0,
  status text default 'Lunas',
  petugas text,
  tanggal_bayar timestamptz default now()
);

create table if not exists surat_pengantar (
  id bigserial primary key,
  nomor_surat text,
  nik text,
  nama text,
  rt text,
  keperluan text not null,
  status text default 'Menunggu RT',
  catatan text,
  file_pdf text,
  created_at timestamptz default now()
);

create table if not exists pengaduan (
  id bigserial primary key,
  nama text,
  nik text,
  no_hp text,
  rt text,
  judul text,
  isi text not null,
  foto_url text,
  status text default 'Menunggu',
  tanggapan text,
  created_at timestamptz default now()
);

create table if not exists pengumuman (
  id bigserial primary key,
  judul text not null,
  isi text,
  penting boolean default false,
  aktif boolean default true,
  created_at timestamptz default now()
);

create table if not exists galeri (
  id bigserial primary key,
  judul text,
  foto_url text,
  keterangan text,
  created_at timestamptz default now()
);

create table if not exists audit_log (
  id bigserial primary key,
  user_id text,
  nama text,
  role text,
  aksi text,
  detail jsonb,
  created_at timestamptz default now()
);

insert into profil_dusun (id) values (1) on conflict (id) do nothing;
insert into rt (nomor_rt,nama_ketua,aktif) values ('06','Ketua RT 06',true),('07','Ketua RT 07',true),('08','Ketua RT 08',true) on conflict (nomor_rt) do nothing;


create table if not exists file_uploads (
  id bigserial primary key,
  folder text,
  filename text,
  url text,
  uploaded_by text,
  created_at timestamptz default now()
);
