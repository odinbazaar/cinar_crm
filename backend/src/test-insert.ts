import { createClient } from '@supabase/supabase-js';

const url = 'https://slanoowprgrcksfqrgak.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODU2NzYsImV4cCI6MjA4MDM2MTY3Nn0.mbm0PFKd-dkIJmMlu9-DLlIvghDzKsLudwtOR6vT28U';

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
