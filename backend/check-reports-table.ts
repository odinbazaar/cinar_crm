import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReportsTable() {
    console.log('Checking employee_reports table...');
    
    // 1. Check if table exists by selecting one row
    const { data: selectData, error: selectError } = await supabase
        .from('employee_reports')
        .select('*')
        .limit(1);

    if (selectError) {
        console.error('❌ employee_reports table error:', selectError.message);
        if (selectError.message.includes('relation "public.employee_reports" does not exist')) {
            console.log('👉 The table has NOT been created yet.');
        }
    } else {
        console.log('✅ employee_reports table exists.');
        if (selectData && selectData.length > 0) {
            console.log('Sample data row keys:', Object.keys(selectData[0]));
        } else {
            console.log('Table is empty.');
        }
    }

    // 2. Check if users table has needed columns (first_name, last_name)
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .limit(1);

    if (userError) {
        console.error('❌ users table error:', userError.message);
    } else {
        console.log('✅ users table has columns:', Object.keys(userData[0] || {}));
    }
}

checkReportsTable();
