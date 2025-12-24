import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

// Reservation data from Excel - Kasım 2025 & Aralık 2025
const reservationData = [
    // Kasım 2025 - 17.11.2025
    { code: 'BB0101', date: '2025-11-17', network: '1', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0101', date: '2025-11-17', network: '1', face: 2, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0102', date: '2025-11-17', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0102', date: '2025-11-17', network: '1', face: 2, brand1: null, status: 'KESN' },
    { code: 'BB0201', date: '2025-11-17', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0202', date: '2025-11-17', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0203', date: '2025-11-17', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0204', date: '2025-11-17', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0301', date: '2025-11-17', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0302', date: '2025-11-17', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0401', date: '2025-11-17', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0402', date: '2025-11-17', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0501', date: '2025-11-17', network: '3', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0502', date: '2025-11-17', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0503', date: '2025-11-17', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0504', date: '2025-11-17', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0601', date: '2025-11-17', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0602', date: '2025-11-17', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0603', date: '2025-11-17', network: '1', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0604', date: '2025-11-17', network: '1', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0605', date: '2025-11-17', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0606', date: '2025-11-17', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0701', date: '2025-11-17', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0702', date: '2025-11-17', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0801', date: '2025-11-17', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0802', date: '2025-11-17', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0901', date: '2025-11-17', network: '2', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB1001', date: '2025-11-17', network: '2', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB1002', date: '2025-11-17', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1003', date: '2025-11-17', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1101', date: '2025-11-17', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1102', date: '2025-11-17', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1201', date: '2025-11-17', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1202', date: '2025-11-17', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1301', date: '2025-11-17', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1302', date: '2025-11-17', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1303', date: '2025-11-17', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1304', date: '2025-11-17', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1305', date: '2025-11-17', network: '3', face: 1, brand1: null, status: 'KESN' },

    // Kasım 2025 - 24.11.2025
    { code: 'BB1401', date: '2025-11-24', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1402', date: '2025-11-24', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1501', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB1502', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB1503', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB1504', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB1505', date: '2025-11-24', network: '3', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB1506', date: '2025-11-24', network: '3', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB1601', date: '2025-11-24', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB1602', date: '2025-11-24', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB1603', date: '2025-11-24', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB1604', date: '2025-11-24', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1605', date: '2025-11-24', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1701', date: '2025-11-24', network: '1', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB1702', date: '2025-11-24', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1703', date: '2025-11-24', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1704', date: '2025-11-24', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1801', date: '2025-11-24', network: '2', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB1802', date: '2025-11-24', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1901', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB1902', date: '2025-11-24', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1903', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB1904', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2001', date: '2025-11-24', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2002', date: '2025-11-24', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2003', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2004', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2101', date: '2025-11-24', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB2102', date: '2025-11-24', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB2103', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2104', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2201', date: '2025-11-24', network: '1', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB2301', date: '2025-11-24', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2302', date: '2025-11-24', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB2303', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2304', date: '2025-11-24', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2401', date: '2025-11-24', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB2402', date: '2025-11-24', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB2501', date: '2025-11-24', network: '2', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB2601', date: '2025-11-24', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB2602', date: '2025-11-24', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },

    // Aralık 2025 - 1.12.2025
    { code: 'BB0101', date: '2025-12-01', network: '1', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0101', date: '2025-12-01', network: '1', face: 2, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0102', date: '2025-12-01', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0102', date: '2025-12-01', network: '1', face: 2, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0201', date: '2025-12-01', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0202', date: '2025-12-01', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0203', date: '2025-12-01', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0204', date: '2025-12-01', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0301', date: '2025-12-01', network: '1', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0302', date: '2025-12-01', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0401', date: '2025-12-01', network: '2', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0402', date: '2025-12-01', network: '2', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0501', date: '2025-12-01', network: '3', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0502', date: '2025-12-01', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0503', date: '2025-12-01', network: '3', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0504', date: '2025-12-01', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0601', date: '2025-12-01', network: '2', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0602', date: '2025-12-01', network: '2', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0603', date: '2025-12-01', network: '1', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0604', date: '2025-12-01', network: '1', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0605', date: '2025-12-01', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0606', date: '2025-12-01', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0607', date: '2025-12-01', network: '1', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0608', date: '2025-12-01', network: '1', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0701', date: '2025-12-01', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0702', date: '2025-12-01', network: '3', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB0801', date: '2025-12-01', network: '2', face: 1, brand1: 'SUSHITTO', status: 'KESN' },
    { code: 'BB0802', date: '2025-12-01', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB0901', date: '2025-12-01', network: '2', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB1001', date: '2025-12-01', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1002', date: '2025-12-01', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1003', date: '2025-12-01', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1101', date: '2025-12-01', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1102', date: '2025-12-01', network: '2', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1201', date: '2025-12-01', network: '3', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB1202', date: '2025-12-01', network: '3', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB1301', date: '2025-12-01', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1302', date: '2025-12-01', network: '1', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1303', date: '2025-12-01', network: '3', face: 1, brand1: null, status: 'KESN' },
    { code: 'BB1304', date: '2025-12-01', network: '3', face: 1, brand1: 'KARŞIYAKA BELEDİYESİ', status: 'KESN' },
    { code: 'BB1305', date: '2025-12-01', network: '3', face: 1, brand1: null, status: 'KESN' },
];

async function seedReservations() {
    console.log('📅 Seeding reservations...');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('❌ Missing environment variables');
        return;
    }

    // First, get all inventory items to map codes to IDs
    const { data: inventoryItems, error: invError } = await supabase
        .from('inventory_items')
        .select('id, code');

    if (invError) {
        console.error('❌ Failed to fetch inventory items:', invError);
        return;
    }

    const codeToId: Record<string, string> = {};
    inventoryItems?.forEach(item => {
        codeToId[item.code] = item.id;
    });

    console.log(`📦 Found ${inventoryItems?.length || 0} inventory items`);

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const res of reservationData) {
        const inventoryItemId = codeToId[res.code];

        if (!inventoryItemId) {
            console.log(`⚠️  Inventory item not found for code: ${res.code}`);
            skipped++;
            continue;
        }

        // Calculate end date (7 days after start)
        const startDate = new Date(res.date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const booking = {
            inventory_item_id: inventoryItemId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            status: res.status === 'KESN' ? 'CONFIRMED' : 'OPTION',
            notes: `Network: ${res.network}, Yüz: ${res.face}${res.brand1 ? `, Marka: ${res.brand1}` : ''}`,
        };

        // Check if similar booking exists
        const { data: existing } = await supabase
            .from('bookings')
            .select('id')
            .eq('inventory_item_id', inventoryItemId)
            .eq('start_date', booking.start_date)
            .single();

        if (!existing) {
            const { error: insertError } = await supabase
                .from('bookings')
                .insert(booking);

            if (insertError) {
                console.error(`❌ Failed to insert reservation for ${res.code} on ${res.date}:`, insertError.message);
                errors++;
            } else {
                console.log(`✅ Inserted reservation: ${res.code} - ${res.date} - ${res.brand1 || 'No brand'}`);
                inserted++;
            }
        } else {
            console.log(`⏭️  Reservation already exists: ${res.code} - ${res.date}`);
            skipped++;
        }
    }

    console.log('\n✨ Reservation seeding completed!');
    console.log(`   📊 Total processed: ${reservationData.length}`);
    console.log(`   ✅ Inserted: ${inserted}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
}

seedReservations();
