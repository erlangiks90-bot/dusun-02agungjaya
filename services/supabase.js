const { createClient } = require('@supabase/supabase-js');
const url=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_ANON_KEY;
if(!url||!key) console.warn('SUPABASE_URL / SUPABASE_ANON_KEY belum diset. Pakai mode demo fallback.');
module.exports=createClient(url||'https://example.supabase.co',key||'dummy-key');
