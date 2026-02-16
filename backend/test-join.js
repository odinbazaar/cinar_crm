const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testJoin() {
    console.log('Testing Joins...');
    const { data, error } = await supabase
        .from('employee_reports')
        .select(`
            *,
            user:users!user_id(first_name, last_name, email),
            reviewer:users!reviewed_by(first_name, last_name)
        `)
        .limit(1);

    if (error) {
        console.error('JOIN ERROR:', error.message);
    } else {
        console.log('JOIN SUCCESS:', JSON.stringify(data, null, 2));
    }
}

testJoin();
