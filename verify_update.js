const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function verify() {
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .in('code', ['BB2301', 'CLP0801'])
        .order('code');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Verification Data:');
    console.log(JSON.stringify(data, null, 2));
}

verify();
