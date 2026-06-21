const express=require('express');
const router=express.Router();
const supabase=require('../services/supabase');
const {requireLogin}=require('../middleware/auth');

let demo=[
 {id:1,nik:'1606010000000001',no_kk:'1606010000000000',nama:'Warga Contoh',rt:'06',alamat:'Dusun 02',pekerjaan:'Petani',tanggal_lahir:'1990-01-01',tempat_lahir:'Agung Jaya',jenis_kelamin:'Laki-laki',no_hp:'',status:'Aktif'}
];

function allowedPayload(body){
 return {
  nik: body.nik,
  no_kk: body.no_kk,
  nama: body.nama,
  tempat_lahir: body.tempat_lahir || '',
  tanggal_lahir: body.tanggal_lahir || null,
  jenis_kelamin: body.jenis_kelamin || '',
  agama: body.agama || '',
  pendidikan: body.pendidikan || '',
  pekerjaan: body.pekerjaan || '',
  status_perkawinan: body.status_perkawinan || '',
  hubungan_keluarga: body.hubungan_keluarga || '',
  golongan_darah: body.golongan_darah || '',
  alamat: body.alamat || '',
  rt: body.rt,
  no_hp: body.no_hp || '',
  status: body.status || 'Aktif',
  foto_url: body.foto_url || '',
  ktp_url: body.ktp_url || '',
  kk_url: body.kk_url || ''
 };
}

router.get('/',requireLogin,async(req,res)=>{
 try{
  let q=supabase.from('warga').select('*').order('nama');
  if(req.session.user.role==='rt') q=q.eq('rt',req.session.user.rt);
  if(req.session.user.role==='masyarakat') q=q.eq('nik',req.session.user.nik);
  const {data,error}=await q;
  if(error) throw error;
  return res.json(data||[]);
 }catch(e){
  let rows=demo;
  if(req.session.user.role==='rt') rows=rows.filter(x=>x.rt===req.session.user.rt);
  if(req.session.user.role==='masyarakat') rows=rows.filter(x=>x.nik===req.session.user.nik);
  res.json(rows);
 }
});

router.post('/',requireLogin,async(req,res)=>{
 if(!['kadus','rt'].includes(req.session.user.role)) return res.status(403).json({error:'Akses ditolak'});
 let payload=allowedPayload(req.body);
 if(req.session.user.role==='rt') payload.rt=req.session.user.rt;
 if(!payload.nik || !payload.nama) return res.status(400).json({error:'NIK dan nama wajib diisi'});
 try{
  const {data:existing}=await supabase.from('warga').select('id,rt').eq('nik',payload.nik).maybeSingle();
  if(req.session.user.role==='rt' && existing && existing.rt !== req.session.user.rt){
    return res.status(403).json({error:'RT tidak boleh mengubah warga RT lain'});
  }
  let result;
  if(existing){
    result=await supabase.from('warga').update(payload).eq('id',existing.id).select().single();
  }else{
    result=await supabase.from('warga').insert(payload).select().single();
  }
  if(result.error) throw result.error;
  res.json(result.data);
 }catch(e){
  const i=demo.findIndex(x=>x.nik===payload.nik);
  if(req.session.user.role==='rt' && i>=0 && demo[i].rt!==req.session.user.rt) return res.status(403).json({error:'RT tidak boleh mengubah warga RT lain'});
  if(i>=0){ demo[i]={...demo[i],...payload}; return res.json(demo[i]); }
  const row={id:Date.now(),...payload}; demo.push(row); res.json(row);
 }
});

router.put('/:id',requireLogin,async(req,res)=>{
 if(!['kadus','rt'].includes(req.session.user.role)) return res.status(403).json({error:'Akses ditolak'});
 let payload=allowedPayload(req.body);
 if(req.session.user.role==='rt') payload.rt=req.session.user.rt;
 try{
  const {data:old}=await supabase.from('warga').select('id,rt').eq('id',req.params.id).maybeSingle();
  if(req.session.user.role==='rt' && old && old.rt!==req.session.user.rt) return res.status(403).json({error:'RT tidak boleh edit RT lain'});
  const {data,error}=await supabase.from('warga').update(payload).eq('id',req.params.id).select().single();
  if(error) throw error;
  res.json(data);
 }catch(e){
  const i=demo.findIndex(x=>String(x.id)===String(req.params.id));
  if(i>=0){
    if(req.session.user.role==='rt' && demo[i].rt!==req.session.user.rt) return res.status(403).json({error:'RT tidak boleh edit RT lain'});
    demo[i]={...demo[i],...payload}; return res.json(demo[i]);
  }
  res.json({});
 }
});

router.delete('/:id',requireLogin,async(req,res)=>{
 if(req.session.user.role!=='kadus') return res.status(403).json({error:'Hanya Kadus yang boleh hapus permanen'});
 try{
  const {error}=await supabase.from('warga').delete().eq('id',req.params.id);
  if(error) throw error;
  res.json({ok:true});
 }catch(e){
  demo=demo.filter(x=>String(x.id)!==String(req.params.id));
  res.json({ok:true});
 }
});

module.exports=router;
