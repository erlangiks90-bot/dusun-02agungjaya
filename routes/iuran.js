const express=require('express');
const router=express.Router();
const supabase=require('../services/supabase');
const {requireLogin,requireRole}=require('../middleware/auth');
let demo=[{id:1,nama_iuran:'Iuran Jalan',nominal:25000,periode:'bulanan',rt_berlaku:'semua',aktif:true}];

router.get('/',requireLogin,async(req,res)=>{
 try{const {data,error}=await supabase.from('iuran').select('*').order('id'); if(error)throw error; res.json(data||[]);}
 catch(e){res.json(demo)}
});
router.post('/',requireRole('kadus'),async(req,res)=>{
 try{const {data,error}=await supabase.from('iuran').insert(req.body).select().single(); if(error)throw error; res.json(data);}
 catch(e){const row={id:Date.now(),...req.body}; demo.push(row); res.json(row)}
});
module.exports=router;
