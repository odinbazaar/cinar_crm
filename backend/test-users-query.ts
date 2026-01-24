import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey!);

async function testFindAll() {
    console.log('Testing select("*") on users...');
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ select("*") failed:', error.message);
    } else {
        console.log('✅ select("*") succeeded. Entries:', data?.length);
    }

    console.log('Testing explicit select with phone...');
    const { data: data2, error: error2 } = await supabase
        .from('users')
        .select('id, email, phone');

    if (error2) {
        console.error('❌ select with phone failed:', error2.message);
    } else {
        console.log('✅ select with phone succeeded.');
    }
}

testFindAll();
