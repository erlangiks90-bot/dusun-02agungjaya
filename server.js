require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sidus_dev_secret';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

let memory = {
  users: [
    { id: '1', username:'kadus', password:'admin123', role:'kadus', nama:'Kepala Dusun' },
    { id: '2', username:'rt01', password:'rt123', role:'rt', nama:'Ketua RT 01', rt:'RT 01' },
    { id: '3', username:'warga', password:'warga123', role:'masyarakat', nama:'Masyarakat', rt:'RT 01' }
  ],
  warga: [], jenis_iuran: [], pembayaran_iuran: [], surat_pengantar: [], pengaduan: [],
  profil_dusun: [{ id:1, nama_dusun:'Dusun 02 Agung Jaya', luas_wilayah:'1.850 Ha', jumlah_rt:4 }]
};

function token(user){ return jwt.sign({ id:user.id, username:user.username, role:user.role, rt:user.rt, nama:user.nama }, JWT_SECRET, { expiresIn:'7d' }); }
function auth(req,res,next){
  const h = req.headers.authorization || '';
  const t = h.replace('Bearer ', '');
  if(!t) return res.status(401).json({ error:'Belum login' });
  try { req.user = jwt.verify(t, JWT_SECRET); next(); } catch(e){ res.status(401).json({ error:'Token tidak valid' }); }
}
function kadusOnly(req,res,next){ if(req.user.role !== 'kadus') return res.status(403).json({error:'Hanya Kadus'}); next(); }
async function list(table){ if(supabase){ const {data,error}=await supabase.from(table).select('*').order('created_at',{ascending:false}); if(error) throw error; return data||[]; } return memory[table]||[]; }
async function insert(table,row){ if(supabase){ const {data,error}=await supabase.from(table).insert(row).select().single(); if(error) throw error; return data; } row.id=String(Date.now()); memory[table].unshift(row); return row; }
async function update(table,id,row){ if(supabase){ const {data,error}=await supabase.from(table).update(row).eq('id',id).select().single(); if(error) throw error; return data; } const arr=memory[table]||[]; const i=arr.findIndex(x=>x.id==id); if(i>=0) arr[i]={...arr[i],...row}; return arr[i]; }
async function remove(table,id){ if(supabase){ const {error}=await supabase.from(table).delete().eq('id',id); if(error) throw error; return true; } memory[table]=(memory[table]||[]).filter(x=>x.id!=id); return true; }

app.post('/api/login', async (req,res)=>{
  const { username, password, role } = req.body;
  try{
    let users = supabase ? (await supabase.from('users').select('*').eq('username',username).eq('role',role)).data : memory.users.filter(u=>u.username===username && u.role===role);
    const user = users && users[0];
    if(!user || user.password !== password) return res.status(401).json({ error:'Username/password salah' });
    res.json({ token: token(user), user:{ id:user.id, username:user.username, role:user.role, nama:user.nama, rt:user.rt } });
  }catch(e){ res.status(500).json({ error:e.message }); }
});

app.get('/api/dashboard', auth, async (req,res)=>{
  try{
    const warga = await list('warga');
    const pengaduan = await list('pengaduan');
    const surat = await list('surat_pengantar');
    const bayar = await list('pembayaran_iuran');
    res.json({
      penduduk: warga.length,
      kk: new Set(warga.map(w=>w.no_kk).filter(Boolean)).size,
      pengaduan: pengaduan.length,
      surat_menunggu: surat.filter(s=>s.status==='Menunggu Kadus').length,
      iuran_masuk: bayar.reduce((a,b)=>a+Number(b.nominal||0),0)
    });
  }catch(e){ res.status(500).json({ error:e.message }); }
});

['warga','jenis_iuran','pembayaran_iuran','surat_pengantar','pengaduan'].forEach(table=>{
  app.get('/api/'+table, auth, async (req,res)=>{ try{ res.json(await list(table)); }catch(e){ res.status(500).json({error:e.message}); } });
  app.post('/api/'+table, auth, async (req,res)=>{ try{ res.json(await insert(table, req.body)); }catch(e){ res.status(500).json({error:e.message}); } });
  app.put('/api/'+table+'/:id', auth, async (req,res)=>{ try{ res.json(await update(table, req.params.id, req.body)); }catch(e){ res.status(500).json({error:e.message}); } });
  app.delete('/api/'+table+'/:id', auth, kadusOnly, async (req,res)=>{ try{ await remove(table, req.params.id); res.json({ok:true}); }catch(e){ res.status(500).json({error:e.message}); } });
});

app.get('/api/public/profil', async (req,res)=>{
  try{
    const profil = supabase ? (await supabase.from('profil_dusun').select('*').eq('id',1).single()).data : memory.profil_dusun[0];
    const warga = await list('warga');
    res.json({ ...profil, jumlah_penduduk:warga.length, jumlah_kk:new Set(warga.map(w=>w.no_kk).filter(Boolean)).size });
  }catch(e){ res.status(500).json({ error:e.message }); }
});
app.post('/api/public/pengaduan', async (req,res)=>{ try{ res.json(await insert('pengaduan', req.body)); }catch(e){ res.status(500).json({error:e.message}); } });

app.get('/api/export/penduduk.json', auth, kadusOnly, async (req,res)=>{ res.json(await list('warga')); });
app.listen(PORT, ()=> console.log('SIDUS jalan di port '+PORT));
