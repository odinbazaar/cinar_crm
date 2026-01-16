import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAndSeed() {
    console.log('🧹 Clearing all data from Supabase...');

    // Delete in order to respect foreign key constraints
    const tables = [
        'proposal_items',
        'proposals',
        'invoices',
        'contracts',
        'communications',
        'contacts',
        'task_assignments',
        'task_approvals',
        'time_entries',
        'tasks',
        'bookings',
        'price_lists',
        'projects',
        'inventory_items',
        'products',
        'customer_requests',
        'resource_allocations',
        'system_settings',
        'clients',
        'users'
    ];

    try {
        for (const table of tables) {
            console.log(`Clearing table: ${table}`);
            const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) {
                console.log(`Note: Could not clear ${table}: ${error.message}`);
            }
        }

        console.log('👤 Seeding default users...');
        const passwordHash = await bcrypt.hash('Cinarcrm123!', 10);

        const users = [
            { email: 'ali@izmiracikhavareklam.com', first_name: 'Ali', last_name: 'Çınar', role: 'ADMIN', password_hash: passwordHash },
            { email: 'ayse@izmiracikhavareklam.com', first_name: 'Ayşe', last_name: 'Yılmaz', role: 'EMPLOYEE', password_hash: passwordHash },
            { email: 'muhasebe@izmiracikhavareklam.com', first_name: 'Muhasebe', last_name: 'Departmanı', role: 'MANAGER', password_hash: passwordHash },
            { email: 'info@izmiracikhavareklam.com', first_name: 'Bilgi', last_name: 'İşlem', role: 'ADMIN', password_hash: passwordHash },
            { email: 'goknil@izmiracikhavareklam.com', first_name: 'Göknil', last_name: 'Hanım', role: 'EMPLOYEE', password_hash: passwordHash },
            { email: 'simge@izmiracikhavareklam.com', first_name: 'Simge', last_name: 'Hanım', role: 'EMPLOYEE', password_hash: passwordHash },
            { email: 'can@izmiracikhavareklam.com', first_name: 'Can', last_name: 'Bey', role: 'EMPLOYEE', password_hash: passwordHash },
            { email: 'cihangir@izmiracikhavareklam.com', first_name: 'Cihangir', last_name: 'Bey', role: 'EMPLOYEE', password_hash: passwordHash },
            { email: 'admin@cinar.com', first_name: 'Admin', last_name: 'User', role: 'ADMIN', password_hash: passwordHash },
        ];

        for (const user of users) {
            const { error } = await supabase.from('users').insert([user]);
            if (error) console.error(`Error creating user ${user.email}:`, error.message);
            else console.log(`Created user: ${user.email}`);
        }

        console.log('✨ Data cleanup and re-seed complete!');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

clearAndSeed();
