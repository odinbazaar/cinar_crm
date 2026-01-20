
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function check() {
    console.log('--- START CHECK ---');
    const { data, error } = await supabase.from('bookings').select('*').limit(5);
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Bookings count in total:', data.length);
        data.forEach(b => {
            console.log(`ID: ${b.id}, Start: ${b.start_date}, B1: ${b.brand_option_1}, Status: ${b.status}`);
        });
    }
    console.log('--- END CHECK ---');
}

check();
