
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function seedInventory() {
    console.log('📦 Seeding inventory...');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('❌ Missing environment variables');
        return;
    }

    try {
        const inventoryItems = [
             {
                code: 'BB-IST-001',
                type: 'Billboard',
                district: 'Kadikoy',
                neighborhood: 'Caferaga',
                address: 'Moda Caddesi No:1',
                network: 'Asian Side',
                is_active: true
            },
            {
                code: 'CLP-IST-002',
                type: 'CLP',
                district: 'Besiktas',
                neighborhood: 'Levent',
                address: 'Buyukdere Caddesi Kanyon AVM Onu',
                network: 'European Side',
                is_active: true
            },
            {
                code: 'MEG-IST-003',
                type: 'Megaboard',
                district: 'Sisli',
                neighborhood: 'Mecidiyekoy',
                address: 'E-5 Yanyol',
                network: 'High Traffic',
                is_active: true
            }
        ];

        // Check for existing items to avoid duplicates/errors if uniq constraints exist
        // For simplicity, we just try to insert and catch duplicate error or use upsert if we had IDs.
        // Since we don't have IDs and code might be unique, let's check first.
        
        for (const item of inventoryItems) {
            const { data: existing } = await supabase
                .from('inventory')
                .select('id')
                .eq('code', item.code)
                .single();

            if (!existing) {
                 const { error } = await supabase
                    .from('inventory')
                    .insert(item);
                
                if (error) {
                    console.error(`❌ Failed to insert ${item.code}:`, error);
                } else {
                    console.log(`✅ Inserted ${item.code}`);
                }
            } else {
                console.log(`⚠️  Item ${item.code} already exists, skipping.`);
            }
        }

        console.log('✨ Inventory seeding completed!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedInventory();
