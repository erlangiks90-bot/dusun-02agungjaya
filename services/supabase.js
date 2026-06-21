const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url || 'https://example.supabase.co', key || 'dummy-key');

module.exports = supabase;
