const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
    console.log("Checking proposals table schema...");
    const { data, error } = await supabase.from('proposals').select('*').limit(1);
    if (error) {
        console.error("Error fetching proposals:", error);
    } else {
        console.log("Proposals sample:", data);
    }

    console.log("\nChecking proposal_items table schema...");
    const { data: items, error: itemsError } = await supabase.from('proposal_items').select('*').limit(1);
    if (itemsError) {
        console.error("Error fetching proposal_items:", itemsError);
    } else {
        console.log("Proposal items sample:", items);
    }
}

checkSchema();
