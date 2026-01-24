import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey!);

async function tryAlterTable() {
    const sql = `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL;
    `;

    // Most Supabase projects don't have exec_sql unless manually added
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('❌ exec_sql failed:', error.message);
        console.log('This is expected if the RPC does not exist.');
    } else {
        console.log('✅ exec_sql succeeded!', data);
    }
}

tryAlterTable();
