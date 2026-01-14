import { createClient } from '@supabase/supabase-js';

const url = 'https://slanoowprgrcksfqrgak.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.bawYE2ig0yEmje8bAEvD9qcrngcmI0r2qV61OeLGu-M';

const client = createClient(url, key);

async function test() {
    const { data, error } = await client.from('users').select('id').limit(1);
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Success, found:', data.length, 'users');
    }
}

test();
