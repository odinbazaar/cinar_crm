import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Using URL:', supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, role, full_name');

    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('Users found:', data);
    }
}

checkUsers();
