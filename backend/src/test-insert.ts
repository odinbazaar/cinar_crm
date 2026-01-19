import { createClient } from '@supabase/supabase-js';

const url = 'https://laltmysfkyppkqykggmh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo';

const supabase = createClient(url, key);

async function addOne() {
    const { data, error } = await supabase.from('users').insert([{
        email: 'test@example.com',
        password: 'password',
        first_name: 'Test',
        last_name: 'User',
        role: 'ADMIN',
        status: 'ACTIVE'
    }]).select();

    if (error) {
        console.error('Error insert:', error.message);
    } else {
        console.log('Success:', data);
    }
}

addOne();
