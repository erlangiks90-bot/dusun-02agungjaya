create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  role text not null check (role in ('kadus','rt','masyarakat')),
  nama text not null,
  rt text,
  created_at timestamptz default now()
);

create table if not exists warga (
  id uuid primary key default gen_random_uuid(),
  nik text,
  no_kk text,
  nama text not null,
  jenis_kelamin text,
  alamat text,
  rt text,
  pekerjaan text,
  no_hp text,
  status text default 'Aktif',
  created_at timestamptz default now()
);

create table if not exists jenis_iuran (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nominal numeric default 0,
  tipe text default 'Bulanan',
  berlaku_rt text default 'Semua',
  aktif boolean default true,
  created_at timestamptz default now()
);

create table if not exists pembayaran_iuran (
  id uuid primary key default gen_random_uuid(),
  warga_id uuid references warga(id) on delete set null,
  jenis_iuran_id uuid references jenis_iuran(id) on delete set null,
  bulan text,
  tahun int,
  nominal numeric default 0,
  petugas text,
  status text default 'Lunas',
  created_at timestamptz default now()
);

create table if not exists surat_pengantar (
  id uuid primary key default gen_random_uuid(),
  no_surat text,
  warga_id uuid references warga(id) on delete set null,
  nama_warga text,
  jenis_surat text,
  keperluan text,
  rt text,
  status text default 'Menunggu Kadus',
  alasan_tolak text,
  created_at timestamptz default now()
);

create table if not exists pengaduan (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  no_hp text,
  rt text,
  jenis text,
  isi text,
  status text default 'Menunggu',
  created_at timestamptz default now()
);

create table if not exists profil_dusun (
  id int primary key default 1,
  nama_dusun text default 'Dusun 02 Agung Jaya',
  luas_wilayah text default '1.850 Ha',
  jumlah_rt int default 4,
  sambutan text default 'Selamat datang di website resmi dusun.',
  alamat text,
  updated_at timestamptz default now()
);

insert into profil_dusun(id) values (1) on conflict (id) do nothing;
insert into users(username,password,role,nama,rt) values
('kadus','admin123','kadus','Kepala Dusun',null),
('rt01','rt123','rt','Ketua RT 01','RT 01'),
('warga','warga123','masyarakat','Masyarakat','RT 01')
on conflict (username) do nothing;
