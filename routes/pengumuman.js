const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { requireRole } = require('../middleware/auth');

let demo = [
  { id: 1, judul: 'Selamat Datang di SIDUS', isi: 'Website resmi Dusun 02 Desa Agung Jaya.', penting: true, aktif: true, created_at: new Date().toISOString() }
];

router.get('/', async (req,res)=>{
  try{
    const {data,error}=await supabase.from('pengumuman').select('*').order('created_at',{ascending:false});
    if(error) throw error;
    res.json(data || []);
  }catch(e){ res.json(demo); }
});

router.post('/', requireRole('kadus'), async (req,res)=>{
  const payload={judul:req.body.judul, isi:req.body.isi, penting:!!req.body.penting, aktif:true};
  try{
    const {data,error}=await supabase.from('pengumuman').insert(payload).select().single();
    if(error) throw error;
    res.json(data);
  }catch(e){
    const row={id:Date.now(), created_at:new Date().toISOString(), ...payload};
    demo.unshift(row); res.json(row);
  }
});

router.put('/:id', requireRole('kadus'), async (req,res)=>{
  try{
    const {data,error}=await supabase.from('pengumuman').update(req.body).eq('id',req.params.id).select().single();
    if(error) throw error;
    res.json(data);
  }catch(e){
    const row=demo.find(x=>String(x.id)===String(req.params.id));
    if(row) Object.assign(row, req.body);
    res.json(row || {});
  }
});

router.delete('/:id', requireRole('kadus'), async (req,res)=>{
  try{
    const {error}=await supabase.from('pengumuman').delete().eq('id',req.params.id);
    if(error) throw error;
    res.json({ok:true});
  }catch(e){
    demo=demo.filter(x=>String(x.id)!==String(req.params.id));
    res.json({ok:true});
  }
});

module.exports = router;
