const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRLS() {
    console.log('Testing RLS with Anon Key...');
    const { data, error } = await supabase.from('employee_reports').select('*');
    if (error) {
        console.error('RLS SELECT ERROR:', error.message);
    } else {
        console.log('RLS SELECT SUCCESS:', data.length, 'rows seen');
    }
}

testRLS();
