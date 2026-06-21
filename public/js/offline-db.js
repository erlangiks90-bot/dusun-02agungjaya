const SIDUS_DB_NAME = 'SIDUS_OFFLINE_DB';
const SIDUS_DB_VERSION = 1;
const STORES = ['warga','kk','surat','pengaduan','pengumuman','galeri','iuran','sync_queue','session'];

function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(SIDUS_DB_NAME, SIDUS_DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      STORES.forEach(name => {
        if(!db.objectStoreNames.contains(name)){
          db.createObjectStore(name, { keyPath:'_id', autoIncrement:true });
        }
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(store, value){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbBulkPut(store, rows){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readwrite');
    const os = tx.objectStore(store);
    os.clear();
    (rows||[]).forEach((row,i)=>os.put({_id: row.id || row._id || i+1, ...row}));
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetAll(store){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function addQueue(item){
  item._id = Date.now() + Math.floor(Math.random()*1000);
  item.created_at = new Date().toISOString();
  item.status = 'pending';
  await dbPut('sync_queue', item);
  updateSyncBadge();
}

async function getQueue(){
  return dbGetAll('sync_queue');
}

async function clearQueueItem(id){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction('sync_queue','readwrite');
    tx.objectStore('sync_queue').delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

function setOnlineBadge(){
  const el = document.getElementById('onlineStatus');
  if(!el) return;
  if(navigator.onLine){
    el.textContent = '🟢 Online';
    el.className = 'online-badge online';
  }else{
    el.textContent = '🔴 Offline';
    el.className = 'online-badge offline';
  }
}

async function updateSyncBadge(){
  const el = document.getElementById('syncStatus');
  if(!el) return;
  const q = await getQueue().catch(()=>[]);
  el.textContent = q.length ? `🟡 ${q.length} belum sinkron` : '✅ Sinkron';
}

async function syncQueue(apiFn){
  if(!navigator.onLine) return;
  const q = await getQueue().catch(()=>[]);
  for(const item of q){
    try{
      await apiFn(item.url, { method:item.method, body:JSON.stringify(item.body) });
      await clearQueueItem(item._id);
    }catch(e){}
  }
  updateSyncBadge();
}

window.SIDUS_OFFLINE = { dbPut, dbBulkPut, dbGetAll, addQueue, getQueue, syncQueue, setOnlineBadge, updateSyncBadge };

window.addEventListener('online', ()=>{ setOnlineBadge(); updateSyncBadge(); });
window.addEventListener('offline', ()=>{ setOnlineBadge(); updateSyncBadge(); });
document.addEventListener('DOMContentLoaded', ()=>{ setOnlineBadge(); updateSyncBadge(); });
