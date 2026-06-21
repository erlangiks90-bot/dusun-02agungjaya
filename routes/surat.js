const express=require('express');
const router=express.Router();
const QRCode=require('qrcode');
const supabase=require('../services/supabase');
const {requireLogin}=require('../middleware/auth');
let demo=[];

router.get('/',requireLogin,async(req,res)=>{
 try{
  let q=supabase.from('surat_pengantar').select('*').order('created_at',{ascending:false});
  if(req.session.user.role==='rt') q=q.eq('rt',req.session.user.rt);
  if(req.session.user.role==='masyarakat') q=q.eq('nik',req.session.user.nik);
  const {data,error}=await q; if(error)throw error; res.json(data||[]);
 }catch(e){res.json(demo)}
});
router.post('/',requireLogin,async(req,res)=>{
 const payload={nomor_surat:req.body.nomor_surat||'',nik:req.body.nik||req.session.user.nik||'',nama:req.body.nama,rt:req.body.rt||req.session.user.rt||'',keperluan:req.body.keperluan,status:req.session.user.role==='masyarakat'?'Menunggu RT':'Menunggu Kadus'};
 try{const {data,error}=await supabase.from('surat_pengantar').insert(payload).select().single(); if(error)throw error; res.json(data);}
 catch(e){const row={id:Date.now(),created_at:new Date().toISOString(),...payload}; demo.unshift(row); res.json(row)}
});
router.put('/:id/status',requireLogin,async(req,res)=>{
 if(!['kadus','rt'].includes(req.session.user.role)) return res.status(403).json({error:'Akses ditolak'});
 try{const {data,error}=await supabase.from('surat_pengantar').update({status:req.body.status,catatan:req.body.catatan,nomor_surat:req.body.nomor_surat}).eq('id',req.params.id).select().single(); if(error)throw error; res.json(data);}
 catch(e){const r=demo.find(x=>String(x.id)===String(req.params.id)); if(r){r.status=req.body.status||r.status;r.catatan=req.body.catatan;r.nomor_surat=req.body.nomor_surat||r.nomor_surat} res.json(r||{})}
});
router.get('/:id/qrcode',async(req,res)=>{
 const url=`${req.protocol}://${req.get('host')}/verifikasi.html?id=${req.params.id}`;
 const qr=await QRCode.toDataURL(url); res.json({qr,url});
});
module.exports=router;
