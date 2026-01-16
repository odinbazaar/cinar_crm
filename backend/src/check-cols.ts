import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL || 'https://slanoowprgrcksfqrgak.supabase.co';
const key = process.env.SUPABASE_KEY || ''; // Use service role if possible

const supabase = createClient(url, key);

async function checkCols() {
    console.log('Checking proposal_items columns...');
    const { data, error } = await supabase.from('proposal_items').select('*').limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else if (data && data.length > 0) {
        console.log('Columns found in proposal_items:');
        const keys = Object.keys(data[0]);
        for (const key of keys) {
            console.log(' -', key);
        }
    } else {
        console.log('No data found in proposal_items, checking via empty select...');
        // Try to fetch headers only if possible, or just assume the schema
        const { data: cols, error: colError } = await supabase.from('proposal_items').select('*').limit(0);
        if (cols) {
            console.log('Empty select headers:', Object.keys(cols));
        }
    }
}

checkCols();
