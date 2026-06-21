const express=require('express');
const router=express.Router();
const supabase=require('../services/supabase');
const {requireRole}=require('../middleware/auth');

const def=[{nomor_rt:'06',nama_ketua:'Ketua RT 06',no_hp:'',aktif:true},{nomor_rt:'07',nama_ketua:'Ketua RT 07',no_hp:'',aktif:true},{nomor_rt:'08',nama_ketua:'Ketua RT 08',no_hp:'',aktif:true}];

router.get('/',async(req,res)=>{
 try{const {data,error}=await supabase.from('rt').select('*').order('nomor_rt'); if(error)throw error; res.json(data?.length?data:def);}
 catch(e){res.json(def)}
});
router.post('/',requireRole('kadus'),async(req,res)=>{
 try{const {data,error}=await supabase.from('rt').insert(req.body).select().single(); if(error)throw error; res.json(data);}
 catch(e){res.status(500).json({error:e.message})}
});
router.put('/:id',requireRole('kadus'),async(req,res)=>{
 try{const {data,error}=await supabase.from('rt').update(req.body).eq('id',req.params.id).select().single(); if(error)throw error; res.json(data);}
 catch(e){res.status(500).json({error:e.message})}
});
module.exports=router;
