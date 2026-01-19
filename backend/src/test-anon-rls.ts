import { createClient } from '@supabase/supabase-js';

const url = 'https://laltmysfkyppkqykggmh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo';

const supabase = createClient(url, anonKey);

async function checkAnonRead() {
    console.log('Checking if ANON can read users in production DB...');
    const { data, error } = await supabase
        .from('users')
        .select('email')
        .limit(1);

    if (error) {
        console.log('❌ ANON CANNOT read users:', error.message);
    } else {
        console.log('✅ ANON CAN read users. Sample:', data);
    }
}

checkAnonRead();
