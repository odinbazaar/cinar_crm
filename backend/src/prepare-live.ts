import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service role to delete

const supabase = createClient(supabaseUrl, supabaseKey);

async function prepareLive() {
    console.log('🚀 Preparing database for LIVE deployment...');
    console.log('🧹 Clearing transactional and test data (Proposals, Clients, Bookings, Projects)...');

    // Order matters for FK constraints
    const tablesToClear = [
        'proposal_items',
        'proposals',
        'communications',
        'contacts',
        'bookings',
        'task_assignments',
        'task_approvals',
        'tasks',
        'time_entries',
        'projects',
        'notifications',
        'customer_requests',
        'clients'
    ];

    for (const table of tablesToClear) {
        process.stdout.write(`Clearing table ${table}... `);
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
            console.log(`❌ Error: ${error.message}`);
        } else {
            console.log('✅ Done');
        }
    }

    console.log('\n✅ Database is now clean and ready for live data entry.');
    console.log('Note: Users and Inventory items were NOT deleted.');
}

prepareLive().catch(console.error);
