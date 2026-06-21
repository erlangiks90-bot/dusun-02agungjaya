const express=require('express');
const router=express.Router();
const supabase=require('../services/supabase');
const {requireLogin}=require('../middleware/auth');

let demo=[];

router.get('/',requireLogin,async(req,res)=>{
 try{
  let q=supabase.from('kk').select('*').order('no_kk');
  if(req.session.user.role==='rt') q=q.eq('rt',req.session.user.rt);
  const {data,error}=await q;
  if(error) throw error;
  res.json(data||[]);
 }catch(e){
  let rows=demo;
  if(req.session.user.role==='rt') rows=rows.filter(x=>x.rt===req.session.user.rt);
  res.json(rows);
 }
});

router.post('/',requireLogin,async(req,res)=>{
 if(!['kadus','rt'].includes(req.session.user.role)) return res.status(403).json({error:'Akses ditolak'});
 const payload={
  no_kk:req.body.no_kk,
  kepala_keluarga:req.body.kepala_keluarga||'',
  alamat:req.body.alamat||'',
  rt:req.session.user.role==='rt'?req.session.user.rt:req.body.rt,
  foto_kk_url:req.body.foto_kk_url||''
 };
 if(!payload.no_kk) return res.status(400).json({error:'No KK wajib diisi'});
 try{
  const {data:old}=await supabase.from('kk').select('id,rt').eq('no_kk',payload.no_kk).maybeSingle();
  if(req.session.user.role==='rt' && old && old.rt!==req.session.user.rt) return res.status(403).json({error:'RT tidak boleh mengubah KK RT lain'});
  let result;
  if(old) result=await supabase.from('kk').update(payload).eq('id',old.id).select().single();
  else result=await supabase.from('kk').insert(payload).select().single();
  if(result.error) throw result.error;
  res.json(result.data);
 }catch(e){
  const i=demo.findIndex(x=>x.no_kk===payload.no_kk);
  if(i>=0){demo[i]={...demo[i],...payload}; return res.json(demo[i]);}
  const row={id:Date.now(),...payload}; demo.push(row); res.json(row);
 }
});

module.exports=router;
