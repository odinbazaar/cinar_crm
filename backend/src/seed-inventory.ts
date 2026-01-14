
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
            { code: 'BB0101', type: 'Billboard', district: 'Konak', neighborhood: 'Alsancak', address: 'Gündoğdu Meydanı', network: '1', is_active: true },
            { code: 'BB0102', type: 'Billboard', district: 'Konak', neighborhood: 'Alsancak', address: 'Kıbrıs Şehitleri Cd.', network: '1', is_active: true },
            { code: 'BB0201', type: 'Billboard', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı İskele', network: '2', is_active: true },
            { code: 'BB0202', type: 'Billboard', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Çarşı Girişi', network: '2', is_active: true },
            { code: 'CLP0101', type: 'CLP', district: 'Bornova', neighborhood: 'Küçükpark', address: 'Ege Üni Giriş', network: '1', is_active: true },
            { code: 'ML0101', type: 'Megalight', district: 'Balçova', neighborhood: 'Eğitim', address: 'Teleferik Karşısı', network: '3', is_active: true }
        ];

        for (const item of inventoryItems) {
            const { data: existing } = await supabase
                .from('inventory_items')
                .select('id')
                .eq('code', item.code)
                .single();

            if (!existing) {
                const { error } = await supabase
                    .from('inventory_items')
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
