import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey!);

async function checkUserColumns() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.error('❌ users table error:', error.message);
    } else {
        console.log('✅ Found users table.');
        if (data && data.length > 0) {
            console.log('Columns in first row:', Object.keys(data[0]));
        } else {
            // If no data, we can't see columns via select * this way easily without RPC or pg_catalog
            console.log('Table is empty, trying to get column names via RPC if possible...');
        }
    }
}

checkUserColumns();
