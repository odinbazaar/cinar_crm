import { createClient } from '@supabase/supabase-js';

const oldUrl = 'https://slanoowprgrcksfqrgak.supabase.co';
const oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.bawYE2ig0yEmje8bAEvD9qcrngcmI0r2qV61OeLGu-M';

const newUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const oldSupabase = createClient(oldUrl, oldKey);
const newSupabase = createClient(newUrl, newKey);

async function fullSync() {
    console.log('🔄 Full Sync: OLD -> NEW');

    const { data: oldInv } = await oldSupabase.from('inventory_items').select('*');
    if (oldInv) {
        console.log(`Found ${oldInv.length} items in old project.`);
        // Try inserting one by one to see errors
        let success = 0;
        for (const item of oldInv) {
            const { error } = await newSupabase.from('inventory_items').upsert(item);
            if (error) {
                if (error.message.includes('unique constraint')) {
                    // ignore
                } else {
                    console.error(`Error item ${item.code}:`, error.message);
                }
            } else {
                success++;
            }
        }
        console.log(`✅ Inventory sync finished: ${success}/${oldInv.length} success`);
    }
}

fullSync();
