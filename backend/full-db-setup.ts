import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAndMigrate() {
    console.log('--- Database Setup & Migration Started ---');

    // 1. Create necessary tables if they don't exist
    const schemaSql = `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            role VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'ACTIVE',
            avatar TEXT,
            phone VARCHAR(50),
            hourly_rate DECIMAL(10, 2),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS clients (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            company_name VARCHAR(255),
            tax_number VARCHAR(50),
            email VARCHAR(255),
            phone VARCHAR(50),
            address TEXT,
            website VARCHAR(255),
            lead_source VARCHAR(100),
            lead_stage VARCHAR(50) DEFAULT 'LEAD',
            brand_mission TEXT,
            brand_tone VARCHAR(255),
            brand_values TEXT,
            target_audience TEXT,
            account_manager_id UUID REFERENCES users(id),
            is_active BOOLEAN DEFAULT true,
            lost_reason TEXT,
            lost_date TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS inventory_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code VARCHAR(50) UNIQUE NOT NULL,
            type VARCHAR(50) NOT NULL,
            district VARCHAR(100) NOT NULL,
            neighborhood VARCHAR(100),
            address TEXT NOT NULL,
            coordinates VARCHAR(100),
            route_no VARCHAR(100),
            network VARCHAR(50),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_inventory_items_code ON inventory_items(code);
        CREATE INDEX IF NOT EXISTS idx_inventory_items_district ON inventory_items(district);

        -- Disable RLS for development if needed
        ALTER TABLE users DISABLE ROW LEVEL SECURITY;
        ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
        ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
    `;

    console.log('Applying schema...');
    // We try to run SQL through a common RPC if it exists, otherwise we'll have to rely on user or existing tables
    let sqlError: any = null;
    try {
        const result = await supabase.rpc('exec_sql', { sql: schemaSql });
        sqlError = result.error;
    } catch (e) {
        sqlError = { message: 'RPC exec_sql not available' };
    }

    if (sqlError) {
        console.log('Note: RPC exec_sql failed (this is normal if not enabled). Please ensure tables exist in public schema.');
    }

    // 2. Migrate Data from halk schema
    console.log('Migrating data from halk schema...');
    const halkClient = createClient(supabaseUrl, supabaseKey, { db: { schema: 'halk' } });

    // Helper to migrate table
    async function migrateTable(halkTableName: string, publicTableName: string, mapper: (item: any) => any) {
        const { data: items, error: fetchError } = await halkClient.from(halkTableName).select('*');
        if (fetchError) {
            console.error(`Error fetching from ${halkTableName}:`, fetchError.message);
            return;
        }
        if (items && items.length > 0) {
            console.log(`Migrating ${items.length} items from ${halkTableName} to ${publicTableName}...`);
            const mapped = items.map(mapper);
            const { error: insertError } = await supabase.from(publicTableName).upsert(mapped, { onConflict: (publicTableName === 'inventory_items' ? 'code' : 'email') });
            if (insertError) console.error(`Error inserting into ${publicTableName}:`, insertError.message);
            else console.log(`✅ Migrated ${publicTableName}`);
        }
    }

    // Migrate Envanter
    await migrateTable('envanter_ürünleri', 'inventory_items', (item) => ({
        code: item.kod || item.id,
        type: item.tip || 'BILLBOARD',
        district: item.ilçe || 'İZMİR',
        neighborhood: item.semt || '',
        address: item.adres || 'Adres yok',
        is_active: true
    }));

    // Migrate Clients
    await migrateTable('müşteriler', 'clients', (item) => ({
        name: item.ad || item.unvan || 'İsimsiz Müşteri',
        type: 'CORPORATE',
        company_name: item.unvan || item.ad,
        email: item.email || null,
        phone: item.telefon || null,
        address: item.adres || null,
        is_active: true
    }));

    // 3. Ensure Ali and other users exist in public.users
    console.log('Seeding users...');
    const passwordHash = await bcrypt.hash('Cinarcrm123!', 10);
    const usersToSeed = [
        { email: 'ali@izmiracikhavareklam.com', first_name: 'Ali', last_name: 'Çınar', role: 'ADMIN', password_hash: passwordHash },
        { email: 'muhasebe@izmiracikhavareklam.com', first_name: 'Muhasebe', last_name: 'Departmanı', role: 'MANAGER', password_hash: passwordHash },
        { email: 'ayse@izmiracikhavareklam.com', first_name: 'Ayşe', last_name: 'Yılmaz', role: 'EMPLOYEE', password_hash: passwordHash }
    ];

    for (const user of usersToSeed) {
        const { error: userError } = await supabase.from('users').upsert(user, { onConflict: 'email' });
        if (userError) console.error(`Error seeding user ${user.email}:`, userError.message);
        else console.log(`👤 User ${user.email} is ready.`);
    }

    console.log('--- Setup & Migration Complete ---');
}

setupAndMigrate();
