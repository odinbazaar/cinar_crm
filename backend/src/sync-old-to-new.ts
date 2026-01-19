import { createClient } from '@supabase/supabase-js';

const oldUrl = 'https://slanoowprgrcksfqrgak.supabase.co';
const oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.bawYE2ig0yEmje8bAEvD9qcrngcmI0r2qV61OeLGu-M';

const newUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const oldSupabase = createClient(oldUrl, oldKey);
const newSupabase = createClient(newUrl, newKey);

async function syncData() {
    console.log('🔄 Sync started: OLD -> NEW');

    // 1. Sync Clients
    console.log('Syncing clients...');
    const { data: clients } = await oldSupabase.from('clients').select('*');
    if (clients && clients.length > 0) {
        const { error } = await newSupabase.from('clients').upsert(clients);
        if (error) console.error('Error syncing clients:', error.message);
        else console.log(`✅ Synced ${clients.length} clients`);
    }

    // 2. Sync Inventory Items
    console.log('Syncing inventory_items...');
    const { data: inv } = await oldSupabase.from('inventory_items').select('*');
    if (inv && inv.length > 0) {
        const { error } = await newSupabase.from('inventory_items').upsert(inv);
        if (error) console.error('Error syncing inventory:', error.message);
        else console.log(`✅ Synced ${inv.length} inventory items`);
    }

    // 3. Sync Bookings
    console.log('Syncing bookings...');
    const { data: bookings } = await oldSupabase.from('bookings').select('*');
    if (bookings && bookings.length > 0) {
        const { error } = await newSupabase.from('bookings').upsert(bookings);
        if (error) console.error('Error syncing bookings:', error.message);
        else console.log(`✅ Synced ${bookings.length} bookings`);
    }

    // 4. Sync Proposals (optional but good)
    console.log('Syncing proposals...');
    const { data: proposals } = await oldSupabase.from('proposals').select('*');
    if (proposals && proposals.length > 0) {
        const { error } = await newSupabase.from('proposals').upsert(proposals);
        if (error) console.error('Error syncing proposals:', error.message);
        else console.log(`✅ Synced ${proposals.length} proposals`);
    }

    console.log('🏁 Sync finished');
}

syncData();
