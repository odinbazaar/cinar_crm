const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanupNetworks() {
    console.log("Checking network distribution...");
    const { data: items, error } = await supabase
        .from('inventory_items')
        .select('network, type, code');

    if (error) {
        console.error("Error:", error);
        return;
    }

    const counts = {};
    items.forEach(item => {
        counts[item.network] = (counts[item.network] || 0) + 1;
    });
    console.log("Current networks:", counts);

    const toDelete = ['5', '6', '7', '8'];
    console.log(`\nDeleting items with networks: ${toDelete.join(', ')}...`);

    const { data: deleted, error: delError } = await supabase
        .from('inventory_items')
        .delete()
        .in('network', toDelete);

    if (delError) {
        console.error("Delete Error:", delError);
    } else {
        console.log("Successfully deleted items with network 5, 6, 7, 8.");
    }
}

cleanupNetworks();
