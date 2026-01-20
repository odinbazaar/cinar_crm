
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function check() {
    console.log('--- START ---');
    const { data: bookings } = await supabase.from('bookings').select('*');
    if (bookings) {
        console.log(`Total: ${bookings.length}`);
        bookings.slice(0, 10).forEach(b => {
            console.log(`B: ${b.start_date} | Brand1: ${b.brand_option_1}`);
        });
    }
}

check();
