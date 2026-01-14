import { createClient } from '@supabase/supabase-js';

const url = 'https://slanoowprgrcksfqrgak.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODU2NzYsImV4cCI6MjA4MDM2MTY3Nn0.mbm0PFKd-dkIJmMlu9-DLlIvghDzKsLudwtOR6vT28U';

const supabase = createClient(url, key);

async function listTables() {
    const { data, error } = await supabase.rpc('get_tables'); // If get_tables RPC exists
    if (error) {
        // Try querying pg_catalog via a function if possible, but usually we just try common names
        console.log('Error listing via RPC, trying direct query on common tables...');
        const tables = ['users', 'clients', 'inventory_items', 'customer_requests', 'bookings', 'proposals', 'notifications', 'time_entries', 'tasks', 'projects'];
        for (const t of tables) {
            const { error: e } = await supabase.from(t).select('count', { count: 'exact', head: true });
            if (e) {
                console.log(`❌ ${t}: ${e.message}`);
            } else {
                console.log(`✅ ${t}`);
            }
        }
    } else {
        console.log('Tables:', data);
    }
}

listTables();
