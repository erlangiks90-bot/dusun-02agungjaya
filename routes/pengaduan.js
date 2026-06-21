const express=require('express');
const router=express.Router();
const supabase=require('../services/supabase');
const {requireLogin}=require('../middleware/auth');
let demo=[];

router.get('/',requireLogin,async(req,res)=>{
 try{
  let q=supabase.from('pengaduan').select('*').order('created_at',{ascending:false});
  if(req.session.user.role==='rt') q=q.eq('rt',req.session.user.rt);
  const {data,error}=await q; if(error)throw error; res.json(data||[]);
 }catch(e){res.json(demo)}
});
router.post('/',async(req,res)=>{
 const payload={...req.body,status:'Menunggu'};
 try{const {data,error}=await supabase.from('pengaduan').insert(payload).select().single(); if(error)throw error; res.json(data);}
 catch(e){const row={id:Date.now(),created_at:new Date().toISOString(),...payload}; demo.unshift(row); res.json(row)}
});
router.put('/:id/status',requireLogin,async(req,res)=>{
 if(!['kadus','rt'].includes(req.session.user.role)) return res.status(403).json({error:'Akses ditolak'});
 try{const {data,error}=await supabase.from('pengaduan').update({status:req.body.status,tanggapan:req.body.tanggapan}).eq('id',req.params.id).select().single(); if(error)throw error; res.json(data);}
 catch(e){const r=demo.find(x=>String(x.id)===String(req.params.id)); if(r){r.status=req.body.status;r.tanggapan=req.body.tanggapan} res.json(r||{})}
});
module.exports=router;
