import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://slanoowprgrcksfqrgak.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.bawYE2ig0yEmje8bAEvD9qcrngcmI0r2qV61OeLGu-M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('proposals').select('proposal_number').order('created_at', { ascending: false }).limit(5);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Last Proposals:', data);
    }
}

test();
