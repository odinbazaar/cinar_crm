const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createLogsTable() {
    console.log("Creating system_logs table...");

    const sql = `
        CREATE TABLE IF NOT EXISTS system_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            level VARCHAR(10) NOT NULL,
            module VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            details TEXT,
            user_id UUID,
            user_name VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
        CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_system_logs_module ON system_logs(module);
    `;

    try {
        // Try to use exec_sql if available
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: sql
        });

        if (error) {
            console.error("Error creating table via RPC:", error.message);
            console.log("\nIf this failed, it means the 'exec_sql' RPC function is not enabled.");
            console.log("Please run the following SQL in the Supabase SQL Editor manually:");
            console.log(sql);
        } else {
            console.log("Successfully created system_logs table.");
        }
    } catch (e) {
        console.error("Exception occurred:", e.message);
    }
}

createLogsTable();
