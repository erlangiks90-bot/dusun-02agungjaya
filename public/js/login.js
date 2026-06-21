async function api(url,options={}){const r=await fetch(url,{headers:{'Content-Type':'application/json'},...options});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Error');return d}
async function login(){
  msg.textContent='Memeriksa...';
  try{
    const data=await api('/api/auth/login',{method:'POST',body:JSON.stringify({role:role.value,username:username.value.trim(),password:password.value})});
    if(window.SIDUS_OFFLINE) await SIDUS_OFFLINE.dbPut('session',{_id:1,user:data.user,username:username.value.trim(),role:role.value});
    if(data.user.role==='kadus')location.href='/fast/kadus';
    else if(data.user.role==='rt')location.href='/fast/rt';
    else location.href='/fast/masyarakat';
  }catch(e){
    if(!navigator.onLine && window.SIDUS_OFFLINE){
      const sessions = await SIDUS_OFFLINE.dbGetAll('session').catch(()=>[]);
      const s = sessions.find(x=>x._id===1 && x.username===username.value.trim() && x.role===role.value);
      if(s && s.user){
        localStorage.setItem('sidus_offline_user', JSON.stringify(s.user));
        if(s.user.role==='kadus')location.href='/fast/kadus';
        else if(s.user.role==='rt')location.href='/fast/rt';
        else location.href='/fast/masyarakat';
        return;
      }
    }
    msg.textContent=e.message || 'Login gagal';
  }
}
