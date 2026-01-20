
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function check() {
    console.log('🔍 Checking bookings for 2026-01-05...');

    // Try both formats just in case
    const targetDates = ['2026-01-05', '05.01.2026'];

    for (const d of targetDates) {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('start_date', d);

        if (error) {
            console.error(`❌ Error for ${d}:`, error.message);
        } else {
            console.log(`✅ Bookings for ${d}:`, data?.length);
            if (data && data.length > 0) {
                console.log('Sample booking:', JSON.stringify(data[0], null, 2));
            }
        }
    }
}

check();
