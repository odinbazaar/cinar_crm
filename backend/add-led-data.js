const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function addLEDData() {
    const items = [
        {
            code: 'LED1',
            type: 'LB',
            district: 'Karşıyaka',
            neighborhood: 'Atakent',
            address: 'Atakent Kavşak',
            coordinates: '38.4710057, 27.0857181',
            network: '1',
            route_no: '1',
            is_active: true
        },
        {
            code: 'LED2',
            type: 'LB',
            district: 'Karşıyaka',
            neighborhood: 'Mavişehir',
            address: 'Mavibahçe Önü',
            coordinates: '38.472764, 27.073822',
            network: '2',
            route_no: '1',
            is_active: true
        }
    ];

    for (const item of items) {
        const { data, error } = await supabase
            .from('inventory_items')
            .upsert(item, { onConflict: 'code' });

        if (error) console.error(`✗ Hata (${item.code}):`, error.message);
        else console.log(`✓ Eklendi/Güncellendi: ${item.code}`);
    }
}

addLEDData();
