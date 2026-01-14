
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function check() {
    console.log('🔍 Checking tables...');

    const tables = ['users', 'clients', 'inventory_items', 'customer_requests', 'bookings', 'proposals'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        if (error) {
            console.error(`❌ Table "${table}" error:`, JSON.stringify(error));
        } else {
            console.log(`✅ Table "${table}" exists. Data:`, data);
        }
    }
}

check();
