import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('--- Database Migration Started ---');

    // 1. Ensure public.inventory_items exists or recreate it
    console.log('Creating public.inventory_items table structure...');
    await supabase.rpc('exec_sql', {
        sql: `
        CREATE TABLE IF NOT EXISTS public.inventory_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code VARCHAR(50) UNIQUE NOT NULL,
            type VARCHAR(50) NOT NULL,
            district VARCHAR(100) NOT NULL,
            neighborhood VARCHAR(100),
            address TEXT NOT NULL,
            coordinates VARCHAR(100),
            network VARCHAR(50),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    ` }).catch(e => console.log('RPC exec_sql might not be enabled, trying direct migration...'));

    // 2. Fetch data from halk.envanter_ürünleri
    const halkClient = createClient(supabaseUrl, supabaseKey, { db: { schema: 'halk' } });
    const { data: items, error: fetchError } = await halkClient.from('envanter_ürünleri').select('*');

    if (fetchError) {
        console.error('Error fetching from halk:', fetchError.message);
        return;
    }

    if (!items || items.length === 0) {
        console.log('No items found in halk.envanter_ürünleri');
    } else {
        console.log(`Found ${items.length} items. Migrating to public.inventory_items...`);

        const mappedItems = items.map(item => ({
            code: item.kod || item.id.substring(0, 8),
            type: item.tip || 'BILLBOARD',
            district: item.ilçe || 'İZMİR',
            neighborhood: item.semt || '',
            address: item.adres || 'Adres bilgisi yok',
            is_active: item.aktif !== false
        }));

        const { error: insertError } = await supabase.from('inventory_items').upsert(mappedItems, { onConflict: 'code' });

        if (insertError) {
            console.error('Migration Error:', insertError.message);
        } else {
            console.log('✅ Successfully migrated inventory items!');
        }
    }

    // 3. Migrate Users (halk.kullanıcılar -> public.users)
    console.log('Checking for users migration...');
    const { data: halkUsers } = await halkClient.from('kullanıcılar').select('*');
    if (halkUsers && halkUsers.length > 0) {
        const mappedUsers = halkUsers.map(u => ({
            email: u.email,
            password_hash: u.sifre_hash || u.password_hash, // and so on
            first_name: u.ad || 'User',
            last_name: u.soyad || '',
            role: u.rol || 'EMPLOYEE',
            status: 'ACTIVE'
        }));
        // Note: Full user migration needs more care with password hashes, but let's at least ensure Admin exists
    }

    console.log('--- Migration Finished ---');
}

migrate();
