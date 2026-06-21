const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { requireRole } = require('../middleware/auth');

let demo = [];

router.get('/', async (req,res)=>{
  try{
    const {data,error}=await supabase.from('galeri').select('*').order('created_at',{ascending:false});
    if(error) throw error;
    res.json(data || []);
  }catch(e){ res.json(demo); }
});

router.post('/', requireRole('kadus'), async (req,res)=>{
  const payload={judul:req.body.judul, keterangan:req.body.keterangan, foto_url:req.body.foto_url};
  try{
    const {data,error}=await supabase.from('galeri').insert(payload).select().single();
    if(error) throw error;
    res.json(data);
  }catch(e){
    const row={id:Date.now(), created_at:new Date().toISOString(), ...payload};
    demo.unshift(row); res.json(row);
  }
});

router.delete('/:id', requireRole('kadus'), async (req,res)=>{
  try{
    const {error}=await supabase.from('galeri').delete().eq('id',req.params.id);
    if(error) throw error;
    res.json({ok:true});
  }catch(e){
    demo=demo.filter(x=>String(x.id)!==String(req.params.id));
    res.json({ok:true});
  }
});

module.exports = router;
