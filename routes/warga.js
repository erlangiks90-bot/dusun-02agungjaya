const express=require('express');
const router=express.Router();
const supabase=require('../services/supabase');
const {requireLogin}=require('../middleware/auth');

let demo=[
 {id:1,nik:'1606010000000001',no_kk:'1606010000000000',nama:'Warga Contoh',rt:'06',alamat:'Dusun 02',pekerjaan:'Petani',no_hp:'',status:'Aktif'}
];

router.get('/',requireLogin,async(req,res)=>{
 try{
  let q=supabase.from('warga').select('*').order('nama');
  if(req.session.user.role==='rt') q=q.eq('rt',req.session.user.rt);
  if(req.session.user.role==='masyarakat') q=q.eq('nik',req.session.user.nik);
  const {data,error}=await q; if(error)throw error; res.json(data||[]);
 }catch(e){
  let rows=demo;
  if(req.session.user.role==='rt') rows=rows.filter(x=>x.rt===req.session.user.rt);
  if(req.session.user.role==='masyarakat') rows=rows.filter(x=>x.nik===req.session.user.nik);
  res.json(rows);
 }
});
router.post('/',requireLogin,async(req,res)=>{
 if(!['kadus','rt'].includes(req.session.user.role)) return res.status(403).json({error:'Akses ditolak'});
 const payload={...req.body}; if(req.session.user.role==='rt') payload.rt=req.session.user.rt;
 try{const {data,error}=await supabase.from('warga').insert(payload).select().single(); if(error)throw error; res.json(data);}
 catch(e){const row={id:Date.now(),...payload}; demo.push(row); res.json(row);}
});
router.put('/:id',requireLogin,async(req,res)=>{
 if(!['kadus','rt'].includes(req.session.user.role)) return res.status(403).json({error:'Akses ditolak'});
 try{const {data,error}=await supabase.from('warga').update(req.body).eq('id',req.params.id).select().single(); if(error)throw error; res.json(data);}
 catch(e){const i=demo.findIndex(x=>String(x.id)===String(req.params.id)); if(i>=0) demo[i]={...demo[i],...req.body}; res.json(demo[i]||{});}
});
router.delete('/:id',requireLogin,async(req,res)=>{
 if(!['kadus','rt'].includes(req.session.user.role)) return res.status(403).json({error:'Akses ditolak'});
 try{const {error}=await supabase.from('warga').delete().eq('id',req.params.id); if(error)throw error; res.json({ok:true});}
 catch(e){demo=demo.filter(x=>String(x.id)!==String(req.params.id)); res.json({ok:true});}
});
module.exports=router;
