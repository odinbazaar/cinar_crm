
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function fix() {
    console.log('🔍 Checking for swapped dates (January/May mixup)...');

    const { data: bookings } = await supabase
        .from('bookings')
        .select('*');

    if (!bookings) return;

    for (const b of bookings) {
        // If start_date is '2026-05-01', it might be a swapped '2026-01-05'
        if (b.start_date.startsWith('2026-05-01')) {
            console.log(`Fixing booking ${b.id}: 2026-05-01 -> 2026-01-05`);
            await supabase.from('bookings').update({
                start_date: '2026-01-05',
                end_date: '2026-01-05'
            }).eq('id', b.id);
        }
    }
    console.log('✅ Done fixing dates.');
}

fix();
