import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function checkColumns() {
    console.log('Introspecting notifications table columns...');

    // Get one row and look at its keys
    const { data, error } = await supabase.from('notifications').select('*').limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found:');
        Object.keys(data[0]).forEach(col => console.log('- ' + col));
    } else {
        console.log('No data found in notifications table.');
    }
}

checkColumns();
