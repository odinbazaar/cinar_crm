import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('Inspecting project:', supabaseUrl);

    // Check public schema
    const { data: publicItems, error: publicError } = await supabase.from('inventory_items').select('count');
    console.log('Public inventory_items:', publicError ? 'Error/Not Found' : publicItems?.length);

    // Check users
    const { data: users, error: usersError } = await supabase.from('users').select('email');
    console.log('Public users:', users?.map(u => u.email).join(', ') || 'None/Error');

    // Try to check halk schema (if possible via RPC or direct select if client configured)
    const halkClient = createClient(supabaseUrl, supabaseKey, {
        db: { schema: 'halk' }
    });

    // Check halk.envanter_ürünleri
    const { data: halkItems, error: halkError } = await halkClient.from('envanter_ürünleri').select('count');
    console.log('Halk envanter_ürünleri:', halkError ? `Error: ${halkError.message}` : (halkItems?.length || 0));
}

inspect();
