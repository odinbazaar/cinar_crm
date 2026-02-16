const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- DB CHECK ---');
    const { data, error } = await supabase.from('employee_reports').select('id').limit(1);
    if (error) {
        console.error('ERROR:', error.message);
    } else {
        console.log('SUCCESS: Table exists');
    }
}
check();
