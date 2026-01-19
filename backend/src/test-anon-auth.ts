import { createClient } from '@supabase/supabase-js';

async function testAnonHashRead() {
    const url = 'https://laltmysfkyppkqykggmh.supabase.co'; // Production URL from QUICK_FIX.md
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo';

    const supabase = createClient(url, anonKey);
    console.log('Testing if ANON can read password_hash...');
    const { data, error } = await supabase
        .from('users')
        .select('email, password_hash')
        .eq('email', 'ali@izmiracikhavareklam.com')
        .single();

    if (error) {
        console.log('❌ Error:', error.message);
    } else {
        console.log('✅ Read success!');
        console.log('Hash length:', data.password_hash?.length);
    }
}

testAnonHashRead();
