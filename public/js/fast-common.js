async function api(url,options={}){const r=await fetch(url,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Error');return d}
async function me(){const d=await api('/api/auth/me');if(!d.user) location.href='/login.html';return d.user}
async function logout(){await api('/api/auth/logout',{method:'POST'});location.href='/'}
function setUser(u){document.getElementById('userText').textContent=`${u.nama} - ${u.role.toUpperCase()}${u.rt?' RT '+u.rt:''}`}
function dashUrl(u){return u.role==='kadus'?'/fast/kadus':u.role==='rt'?'/fast/rt':'/fast/masyarakat'}
function umur(tgl){if(!tgl)return '-';const d=new Date(tgl);if(isNaN(d))return '-';const n=new Date();let u=n.getFullYear()-d.getFullYear();const m=n.getMonth()-d.getMonth();if(m<0||(m===0&&n.getDate()<d.getDate()))u--;return u+' th'}
function kelompokUmur(tgl){if(!tgl)return 'Tidak diketahui';const x=parseInt(umur(tgl));if(isNaN(x))return 'Tidak diketahui';if(x<=5)return 'Balita';if(x<=12)return 'Anak';if(x<=17)return 'Remaja';if(x<=59)return 'Dewasa';return 'Lansia'}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
