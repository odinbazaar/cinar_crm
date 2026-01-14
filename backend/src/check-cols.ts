import { createClient } from '@supabase/supabase-js';

const url = 'https://slanoowprgrcksfqrgak.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODU2NzYsImV4cCI6MjA4MDM2MTY3Nn0.mbm0PFKd-dkIJmMlu9-DLlIvghDzKsLudwtOR6vT28U';

const supabase = createClient(url, key);

async function checkCols() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.error('Error:', error.message);
    } else if (data && data.length > 0) {
        const keys = Object.keys(data[0]);
        for (const key of keys) {
            console.log('COL:', key);
        }
    } else {
        console.log('No data');
    }
}

checkCols();
