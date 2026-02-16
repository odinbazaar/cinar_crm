const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setup() {
    console.log("Setting up employee_reports table...");

    const sql = `
        CREATE TABLE IF NOT EXISTS employee_reports (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            week_starting DATE NOT NULL,
            content TEXT NOT NULL,
            status TEXT DEFAULT 'SUBMITTED',
            review_note TEXT,
            reviewed_by UUID REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
            UNIQUE(user_id, week_starting)
        );
    `;

    try {
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
            console.error("RPC Error:", error.message);
            console.log("Manual SQL execution required if exec_sql is not available.");
        } else {
            console.log("Table created successfully (or already existed).");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

setup();
