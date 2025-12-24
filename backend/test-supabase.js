// Test Supabase connection and user lookup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSupabase() {
    console.log('\n=================================');
    console.log('Testing Supabase Connection');
    console.log('=================================');
    console.log('URL:', process.env.SUPABASE_URL);
    console.log('Key:', process.env.SUPABASE_ANON_KEY ? 'Loaded (' + process.env.SUPABASE_ANON_KEY.substring(0, 10) + '...)' : 'Missing');

    try {
        // Test 1: Fetch user
        console.log('\n📝 Test 1: Fetching admin user...');
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
            console.log('Name:', user.first_name, user.last_name);
            console.log('Role:', user.role);
            console.log('Hash preview:', user.password_hash?.substring(0, 30));

            // Test 2: Verify password
            const bcrypt = require('bcrypt');
            const isValid = await bcrypt.compare('admin123', user.password_hash);
            console.log('\n🔑 Password verification:', isValid ? '✅ VALID' : '❌ INVALID');
        }

    } catch (err) {
        console.error('❌ Fatal error:', err);
    }

    console.log('=================================\n');
}

testSupabase();
