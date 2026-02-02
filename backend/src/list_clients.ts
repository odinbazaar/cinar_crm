import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const url = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-key') as string;
const supabase = createClient(url, key);
async function list() {
    const { data, error } = await supabase.from('clients').select('id, company_name, name').order('created_at', { ascending: false }).limit(20);
    if (data) {
        data.forEach(c => console.log(`- ${c.id}: ${c.company_name} (${c.name})`));
    }
}
list();
