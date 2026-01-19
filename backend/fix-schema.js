const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixSchema() {
    console.log("Applying schema fixes...");

    // 1. Add metadata to proposal_items
    const { error: metadataError } = await supabase.rpc('exec_sql', {
        sql: "ALTER TABLE proposal_items ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';"
    }).catch(e => ({ error: e }));

    if (metadataError) {
        console.warn("RPC exec_sql for metadata failed (expected if not enabled). Trying direct query...");
        // If RPC is not available, we can't easily run ALTER from JS client without a custom function.
        // But we can check if it works.
    }

    // Since we can't run ALTER TABLE directly via supabase-js REST API (only via RPC if configured),
    // and I don't know if 'exec_sql' exists, I'll try to use the UI if I could.
    // But I am an agent, I can't use the SQL Editor UI directly.

    // Let's check if the column exists now.
    const { data, error } = await supabase.from('proposal_items').select('metadata').limit(1);
    if (error) {
        console.error("Column 'metadata' STILL MISSING in proposal_items:", error.message);
    } else {
        console.log("Column 'metadata' exists in proposal_items.");
    }
}

fixSchema();
