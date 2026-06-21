const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const supabase = require('../services/supabase');

const demoUsers = [
  { id:'demo-kadus', nama:'Erlang Saputra', username:'kadus', password:'admin123', role:'kadus', rt:null, nik:null },
  { id:'demo-rt06', nama:'Ketua RT 06', username:'rt06', password:'rt06123', role:'rt', rt:'06', nik:null },
  { id:'demo-rt07', nama:'Ketua RT 07', username:'rt07', password:'rt07123', role:'rt', rt:'07', nik:null },
  { id:'demo-rt08', nama:'Ketua RT 08', username:'rt08', password:'rt08123', role:'rt', rt:'08', nik:null },
  { id:'demo-warga', nama:'Warga Contoh', username:'1606010000000001', password:'warga123', role:'masyarakat', rt:'06', nik:'1606010000000001' }
];

router.post('/login', async (req,res)=>{
  const {role, username, password} = req.body;
  if(!role || !username || !password) return res.status(400).json({error:'Data login belum lengkap'});
  try{
    const {data, error} = await supabase.from('users')
      .select('*')
      .eq('role', role)
      .or(`username.eq.${username},nik.eq.${username}`)
      .eq('aktif', true)
      .maybeSingle();
    if(!error && data){
      const ok = await bcrypt.compare(password, data.password_hash || '');
      if(!ok) return res.status(401).json({error:'Username/NIK atau password salah'});
      req.session.user = {id:data.id,nama:data.nama,role:data.role,rt:data.rt,nik:data.nik};
      return res.json({ok:true,user:req.session.user});
    }
  }catch(e){}
  const u = demoUsers.find(x=>x.role===role && x.username===username && x.password===password);
  if(!u) return res.status(401).json({error:'Username/NIK atau password salah'});
  req.session.user = {id:u.id,nama:u.nama,role:u.role,rt:u.rt,nik:u.nik};
  res.json({ok:true,user:req.session.user,demo:true});
});

router.get('/me',(req,res)=>res.json({user:req.session.user||null}));
router.post('/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
module.exports = router;
