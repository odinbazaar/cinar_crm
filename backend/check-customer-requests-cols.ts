import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey!);

async function checkCustomerRequests() {
    console.log('Checking customer_requests table columns...');
    const { data, error } = await supabase.from('customer_requests').select('*').limit(1);

    if (error) {
        console.error('❌ customer_requests table error:', error.message);
    } else {
        console.log('✅ customer_requests table works.');
        if (data && data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        } else {
            console.log('Table is empty.');
        }
    }
}

checkCustomerRequests();
