const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncAndCreateInventory() {
    try {
        const rawData = fs.readFileSync('full_inventory_data.json', 'utf8');
        const items = JSON.parse(rawData);

        console.log(`Excel'den toplam ${items.length} kayıt okundu.`);

        let updatedCount = 0;
        let createdCount = 0;
        let skipCount = 0;

        for (const item of items) {
            const code = String(item.Kod || '').trim();
            if (!code || code === 'null' || code === 'undefined' || code === 'Kod' || code === 'nan') {
                continue;
            }

            let network = String(item.Network || '').trim();
            if (network === 'BLD' || network === 'BELEDİYE') network = 'BELEDİYE';
            else if (network === 'nan') network = '';

            const routeNo = String(item['Rout No'] || '').trim();
            const cleanRouteNo = (routeNo === 'nan' || routeNo === 'null') ? null : routeNo;

            const type = String(item.Sheet || '').trim();
            const district = String(item['İlçe'] || 'Karşıyaka').trim();
            const neighborhood = String(item['Semt'] || '').trim();
            const address = String(item['Adres'] || '').trim();
            const coordinates = String(item['Koordinat'] || '').trim();

            // Use upsert to update if code exists, otherwise insert
            // Note: Upsert needs a unique constraint. If 'code' is not unique, we should check first.
            // Let's check first to be safe and provide better logging.

            const { data: existing } = await supabase
                .from('inventory_items')
                .select('id')
                .eq('code', code)
                .single();

            const payload = {
                code,
                type: type === 'CLP' ? 'CLP' : type, // Keep original types
                district,
                neighborhood,
                address,
                coordinates,
                network,
                route_no: cleanRouteNo,
                is_active: true
            };

            if (existing) {
                const { error } = await supabase
                    .from('inventory_items')
                    .update(payload)
                    .eq('id', existing.id);

                if (error) console.error(`✗ Hata (Update ${code}):`, error.message);
                else {
                    updatedCount++;
                    // console.log(`✓ Güncellendi: ${code}`);
                }
            } else {
                const { error } = await supabase
                    .from('inventory_items')
                    .insert([payload]);

                if (error) console.error(`✗ Hata (Insert ${code}):`, error.message);
                else {
                    createdCount++;
                    console.log(`+ Yeni Eklendi: ${code} (${type})`);
                }
            }
        }

        console.log('\n=== SENKRONİZASYON ÖZETİ ===');
        console.log(`Güncellenen Kayıt: ${updatedCount}`);
        console.log(`Yeni Eklenen Kayıt: ${createdCount}`);
    } catch (err) {
        console.error('Kritik hata:', err);
    }
}

syncAndCreateInventory();
