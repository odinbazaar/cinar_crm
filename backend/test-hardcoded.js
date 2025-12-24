const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials from user input
const SUPABASE_URL = 'https://slanoowprgrcksfqrgak.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.bawYE2ig0yEmje8bAEvD9qcrngcmI0r2qV61OeLGu-M'; // Service Role Key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSupabase() {
    console.log('\n=================================');
    console.log('Testing Supabase Connection (Hardcoded)');
    console.log('=================================');

    try {
        console.log('\n📝 Test: Fetching admin user...');
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'admin@cinar.com')
            .single();

        if (error) {
            console.error('❌ Error:', error);
        } else {
            console.log('✅ User found!');
            console.log('Email:', user.email);
        }

    } catch (err) {
        console.error('❌ Fatal error:', err);
    }
    console.log('=================================\n');
}

testSupabase();
