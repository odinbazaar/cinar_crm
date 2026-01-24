import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey!);

async function checkSystemSettings() {
    const { data, error } = await supabase.from('system_settings').select('*');
    if (error) {
        console.error('❌ system_settings table error:', error.message);
    } else {
        console.log('✅ system_settings table exists. Rows:', data?.length);
        console.log('Data:', data);
    }
}

checkSystemSettings();
