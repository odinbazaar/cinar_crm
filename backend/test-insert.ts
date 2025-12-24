import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = 'https://slanoowprgrcksfqrgak.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.bawYE2ig0yEmje8bAEvD9qcrngcmI0r2qV61OeLGu-M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const payload = {
        proposal_number: 'TEST-' + Date.now(),
        title: 'Script Test',
        client_id: 'c2e69f5f-dd56-49fd-85b0-ee40270ce2e7',
        subtotal: 4300,
        tax_rate: 20,
        tax_amount: 860,
        total: 5160,
        status: 'DRAFT',
        created_by_id: 'a9256112-796f-4764-9495-ccfd60b8379e'
    };

    console.log('Attempting insert with:', payload);
    const { data, error } = await supabase.from('proposals').insert([payload]).select().single();

    if (error) {
        console.error('Insert Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('Insert Success:', data.id);
    }
}

test();
