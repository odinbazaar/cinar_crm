import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

// MGL (Megalight) inventory items from Excel - Karşıyaka
const mglItems = [
    { code: 'MGL0101', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Bahrihiye Üçok Bulvarı Karşıyaka Belediyesi Önü', coordinates: '38.45968, 27.11424' },
    { code: 'MGL0102', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Bahrihiye Üçok Bulvarı Karşıyaka Belediyesi Önü', coordinates: '38.45968, 27.11424' },
    { code: 'MGL0201', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı Girişi İzban Karşısı', coordinates: '38.45772, 27.11513' },
    { code: 'MGL0202', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı Girişi İzban Karşısı', coordinates: '38.45772, 27.11513' },
    { code: 'MGL0301', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İş Bankası Önü', coordinates: '38.45547, 27.11936' },
    { code: 'MGL0302', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İş Bankası Önü', coordinates: '38.45547, 27.11936' },
    { code: 'MGL0401', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Sahil Girişi', coordinates: '38.45375, 27.10075' },
    { code: 'MGL0402', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Sahil Girişi', coordinates: '38.45375, 27.10075' },
    { code: 'MGL0501', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Tramvay Durağı Çıkışı', coordinates: '38.45888, 27.08933' },
    { code: 'MGL0502', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Tramvay Durağı Çıkışı', coordinates: '38.45888, 27.08933' },
    { code: 'MGL0601', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Çarşı', coordinates: '38.45719, 27.09822' },
    { code: 'MGL0602', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Çarşı', coordinates: '38.45719, 27.09822' },
    { code: 'MGL0701', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Ataşehir', address: 'Hilltown Karşısı Hamza Rüstem Fotoğraf Müzesi', coordinates: '38.47966, 27.07563' },
    { code: 'MGL0702', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Ataşehir', address: 'Hilltown Karşısı Hamza Rüstem Fotoğraf Müzesi', coordinates: '38.47966, 27.07563' },
    { code: 'MGL0801', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Mavişehir Filizler Anaokulu Karşısı', coordinates: '38.47447, 27.0833' },
    { code: 'MGL0802', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Mavişehir Filizler Anaokulu Karşısı', coordinates: '38.47447, 27.0833' },
    { code: 'MGL0901', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Mavişehir Bilim Müzesi', coordinates: '38.47472, 27.08094' },
    { code: 'MGL0902', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Mavişehir Bilim Müzesi', coordinates: '38.47472, 27.08094' },
    { code: 'MGL1001', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Doğa Koleji Önü', coordinates: '38.47505, 27.08481' },
    { code: 'MGL1002', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Doğa Koleji Önü', coordinates: '38.47505, 27.08481' },
];

// Additional BB items from Network sheets (that might not be in the first batch)
const additionalBBItems = [
    // Network 1 - some items that might be missing
    { code: 'BB0101', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Kent A.Ş Karşısı', coordinates: '38.49505, 27.11641' },
    { code: 'BB0102', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Kent A.Ş Karşısı', coordinates: '38.49505, 27.11641' },

    // Network 2 - additional items
    { code: 'BB0203', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Karşıyaka Tenis Kortları Karşısı', coordinates: '38.49472, 27.11613' },
    { code: 'BB0204', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Karşıyaka Tenis Kortları Karşısı', coordinates: '38.49472, 27.11613' },
    { code: 'BB0401', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Karşısı', coordinates: '38.49221, 27.09148' },
    { code: 'BB0402', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Karşısı', coordinates: '38.49221, 27.09148' },
    { code: 'BB0601', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 1', coordinates: '38.48713, 27.09191' },
    { code: 'BB0602', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 1', coordinates: '38.48713, 27.09191' },
    { code: 'BB0801', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Diş Hastanesi Önü', coordinates: '38.471, 27.09958' },
    { code: 'BB0802', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Diş Hastanesi Önü', coordinates: '38.471, 27.09958' },

    // Network 3 - additional items
    { code: 'BB0503', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Çevreyolu Çıkışı', coordinates: '38.4909, 27.0909' },
    { code: 'BB0504', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Çevreyolu Çıkışı', coordinates: '38.4909, 27.0909' },
    { code: 'BB1201', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Gode Cengiz Futbol Sahası Önü', coordinates: '38.46113, 27.09972' },
    { code: 'BB1202', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Gode Cengiz Futbol Sahası Önü', coordinates: '38.46113, 27.09972' },
    { code: 'BB1304', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988' },
    { code: 'BB1305', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988' },
    { code: 'BB1503', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947' },
    { code: 'BB1504', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947' },
    { code: 'BB1604', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827' },
    { code: 'BB1605', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827' },
    { code: 'BB1903', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Flamingo Caddesi Hilltown Girişi', coordinates: '38.47633, 27.06923' },
    { code: 'BB1904', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Flamingo Caddesi Hilltown Girişi', coordinates: '38.47633, 27.06923' },
    { code: 'BB2003', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Modern 4 Kavşak', coordinates: '38.47796, 27.08661' },
    { code: 'BB2004', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Modern 4 Kavşak', coordinates: '38.47796, 27.08661' },
    { code: 'BB2103', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Sports International Önü', coordinates: '38.46786, 27.0805' },
    { code: 'BB2104', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Sports International Önü', coordinates: '38.46786, 27.0805' },
    { code: 'BB2303', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Yeni Girne Çevreyolu Kavşağı', coordinates: '38.49066, 27.11522' },
    { code: 'BB2304', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Yeni Girne Çevreyolu Kavşağı', coordinates: '38.49066, 27.11522' },
];

async function seedAdditionalInventory() {
    console.log('📦 Seeding MGL and additional inventory items...');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('❌ Missing environment variables');
        return;
    }

    const allItems = [
        ...mglItems.map(item => ({ ...item, network: 'Karşıyaka', is_active: true })),
        ...additionalBBItems.map(item => ({ ...item, network: 'Karşıyaka', is_active: true })),
    ];

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    try {
        for (const item of allItems) {
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
                    console.error(`❌ Failed to insert ${item.code}:`, error.message);
                    errors++;
                } else {
                    console.log(`✅ Inserted ${item.code} (${item.type})`);
                    inserted++;
                }
            } else {
                console.log(`⚠️  ${item.code} already exists, skipping.`);
                skipped++;
            }
        }

        console.log('\n✨ Additional inventory seeding completed!');
        console.log(`   📊 Total items processed: ${allItems.length}`);
        console.log(`   ✅ Inserted: ${inserted}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedAdditionalInventory();
