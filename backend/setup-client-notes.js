const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || "https://laltmysfkyppkqykggmh.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupClientNotes() {
    console.log("Setting up client_notes table...");

    const sql = `
        CREATE TABLE IF NOT EXISTS client_notes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            note_date DATE DEFAULT CURRENT_DATE,
            reminder_date TIMESTAMP WITH TIME ZONE,
            is_reminded BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
        CREATE INDEX IF NOT EXISTS idx_client_notes_note_date ON client_notes(note_date);
        CREATE INDEX IF NOT EXISTS idx_client_notes_reminder_date ON client_notes(reminder_date) WHERE is_reminded = false;

        -- RLS
        ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow all for authenticated users" ON client_notes;
        CREATE POLICY "Allow all for authenticated users" ON client_notes
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);

        DROP POLICY IF EXISTS "Allow all for service role" ON client_notes;
        CREATE POLICY "Allow all for service role" ON client_notes
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    `;

    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: sql
        });

        if (error) {
            console.error("Error creating client_notes table:", error);
            // If exec_sql fails, we might need to create it differently or ask the user.
            // But let's try.
        } else {
            console.log("Successfully created client_notes table.");
        }
    } catch (e) {
        console.error("Exception:", e.message);
    }
}

setupClientNotes();
