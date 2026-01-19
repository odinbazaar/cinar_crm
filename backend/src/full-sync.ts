import { createClient } from '@supabase/supabase-js';

const oldUrl = 'https://slanoowprgrcksfqrgak.supabase.co';
const oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.bawYE2ig0yEmje8bAEvD9qcrngcmI0r2qV61OeLGu-M';

const newUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const oldSupabase = createClient(oldUrl, oldKey);
const newSupabase = createClient(newUrl, newKey);

async function fullSync() {
    console.log('🔄 Full Sync: OLD -> NEW');

    // Sync Inventory (forcing migration of all)
    const { data: oldInv } = await oldSupabase.from('inventory_items').select('*');
    if (oldInv) {
        console.log(`Found ${oldInv.length} items in old project.`);
        await newSupabase.from('inventory_items').upsert(oldInv);
        console.log('✅ Inventory synced');
    }

    // Sync Bookings
    const { data: oldBookings } = await oldSupabase.from('bookings').select('*');
    if (oldBookings) {
        console.log(`Found ${oldBookings.length} bookings in old project.`);
        await newSupabase.from('bookings').upsert(oldBookings);
        console.log('✅ Bookings synced');
    }
}

fullSync();
