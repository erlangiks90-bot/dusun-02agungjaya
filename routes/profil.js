const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { requireRole } = require('../middleware/auth');

const defaultProfil = {
  nama_dusun:'Dusun 02', desa:'Agung Jaya', kecamatan:'Lalan', kabupaten:'Musi Banyuasin', provinsi:'Sumatera Selatan',
  kadus:'Erlang Saputra', luas_wilayah:'Belum diisi', jumlah_penduduk:110, jumlah_kk:35,
  running_teks:'Selamat datang di Website Resmi Dusun 02 Desa Agung Jaya Kecamatan Lalan Kabupaten Musi Banyuasin.',
  whatsapp:'', logo_url:'', banner_url:''
};

router.get('/', async (req,res)=>{
  try{
    const {data,error}=await supabase.from('profil_dusun').select('*').eq('id',1).maybeSingle();
    if(error) throw error;
    res.json(data||defaultProfil);
  }catch(e){ res.json(defaultProfil); }
});

router.put('/', requireRole('kadus'), async (req,res)=>{
  try{
    const {data,error}=await supabase.from('profil_dusun').upsert({id:1,...req.body}).select().single();
    if(error) throw error;
    res.json(data);
  }catch(e){ res.status(500).json({error:e.message}); }
});
module.exports=router;
