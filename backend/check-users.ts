import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://slanoowprgrcksfqrgak.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.bawYE2ig0yEmje8bAEvD9qcrngcmI0r2qV61OeLGu-M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: users, error } = await supabase.from('users').select('id, email');
    if (error) {
        console.error('Error fetching users:', error);
    } else if (users && users.length > 0) {
        users.forEach(u => console.log('USER:' + u.email));
        console.log('VALID_USER_ID:' + users[0].id);
    } else {
        console.log('No users found.');
    }
}

main();
