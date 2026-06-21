const express=require('express');
const bcrypt=require('bcryptjs');
const router=express.Router();
const supabase=require('../services/supabase');
const demoUsers=[
{nama:'Erlang Saputra',username:'kadus',password:'admin123',role:'kadus',rt:null,nik:null},
{nama:'Ketua RT 06',username:'rt06',password:'rt06123',role:'rt',rt:'06',nik:null},
{nama:'Ketua RT 07',username:'rt07',password:'rt07123',role:'rt',rt:'07',nik:null},
{nama:'Ketua RT 08',username:'rt08',password:'rt08123',role:'rt',rt:'08',nik:null},
{nama:'Warga Contoh',username:'1606010000000001',password:'warga123',role:'masyarakat',rt:'06',nik:'1606010000000001'}];
router.post('/login',async(req,res)=>{const{role,username,password}=req.body;if(!username||!password||!role)return res.status(400).json({error:'Data login belum lengkap'});try{const{data,error}=await supabase.from('users').select('*').eq('role',role).or(`username.eq.${username},nik.eq.${username}`).eq('aktif',true).maybeSingle();if(!error&&data){const ok=await bcrypt.compare(password,data.password_hash||'');if(!ok)return res.status(401).json({error:'Username atau password salah'});req.session.user={id:data.id,nama:data.nama,role:data.role,rt:data.rt,nik:data.nik};return res.json({ok:true,user:req.session.user});}}catch(e){console.log('Login Supabase fallback:',e.message)}const demo=demoUsers.find(u=>u.role===role&&u.username===username&&u.password===password);if(!demo)return res.status(401).json({error:'Username atau password salah'});req.session.user={id:'demo-'+demo.role,nama:demo.nama,role:demo.role,rt:demo.rt,nik:demo.nik};res.json({ok:true,user:req.session.user,demo:true});});
router.get('/me',(req,res)=>res.json({user:req.session.user||null}));
router.post('/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
module.exports=router;
