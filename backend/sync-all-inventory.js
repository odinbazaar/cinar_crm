const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncAllInventory() {
    try {
        const rawData = fs.readFileSync('all_inventory.json', 'utf8');
        const items = JSON.parse(rawData);

        console.log(`Excel'den toplam ${items.length} kayıt okundu.`);

        let updatedCount = 0;
        let createdCount = 0;
        let skipCount = 0;

        for (const item of items) {
            const code = String(item.Kod || '').trim();
            let network = String(item.Network || '').trim();
            const routeNo = String(item['Rout No'] || '').trim();
            const sheetType = String(item.Sheet || '').trim();

            if (!code || code === 'null' || code === 'undefined' || code === 'Kod' || code === 'nan') {
                skipCount++;
                continue;
            }

            // Network conversion
            if (network === 'BLD' || network === 'BELEDİYE') {
                network = 'BELEDİYE';
            } else if (network === 'nan') {
                network = '';
            }

            const cleanRouteNo = (routeNo === 'nan' || routeNo === 'null') ? null : routeNo;

            // Try to update
            const { data, error } = await supabase
                .from('inventory_items')
                .update({
                    network: network,
                    route_no: cleanRouteNo
                })
                .eq('code', code)
                .select();

            if (error) {
                console.error(`✗ Hata (${code}):`, error.message);
            } else if (data && data.length > 0) {
                updatedCount++;
                console.log(`✓ Güncellendi [${sheetType}]: ${code} (NW: ${network}, R: ${cleanRouteNo})`);
            } else {
                // If not found, we could potentially create it, but we lack mandatory fields like address/district in this simplified export
                // For now just log it
                // console.log(`? Bulunamadı: ${code}`);
                skipCount++;
            }
        }

        console.log('\n=== SENKRONİZASYON ÖZETİ ===');
        console.log(`Güncellenen Kayıt (BB, CLP, MGL, vb.): ${updatedCount}`);
        console.log(`Atlanan/Bulunamayan: ${skipCount}`);
    } catch (err) {
        console.error('Kritik hata:', err);
    }
}

syncAllInventory();
