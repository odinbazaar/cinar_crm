import supabase from './config/supabase.config';
import * as dotenv from 'dotenv';
dotenv.config();

async function dumpUsers() {
    console.log('SUPABASE_URL from env:', process.env.SUPABASE_URL);
    // @ts-ignore
    console.log('Effective URL:', supabase.supabaseUrl);

    const { data, error } = await supabase
        .from('users')
        .select('email, role');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('USERS:', JSON.stringify(data));
    }
}

dumpUsers();
