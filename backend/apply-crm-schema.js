const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function applyCRMColumns() {
    console.log("Applying CRM columns to clients table...");

    const sql = `
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS lead_source TEXT;
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS request_detail TEXT;
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS called_phone TEXT;
    `;

    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: sql
        });

        if (error) {
            console.error("Error applying Schema via RPC exec_sql:", error);
            console.log("\nIf this failed, it means the 'exec_sql' RPC function is not enabled in your Supabase project.");
            console.log("Please run the following SQL in the Supabase SQL Editor manually:");
            console.log(sql);
        } else {
            console.log("Successfully applied CRM columns.");
        }
    } catch (e) {
        console.error("Exception occurred:", e.message);
    }
}

applyCRMColumns();
