const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncExcelToSupabase() {
    try {
        const rawData = fs.readFileSync('networks.json', 'utf8');
        const networks = JSON.parse(rawData);

        console.log(`Excel'den ${networks.length} kayıt okundu.`);

        let updatedCount = 0;
        let noMatchCount = 0;

        for (const item of networks) {
            const code = String(item.Kod).trim();
            let network = String(item.Network).trim();
            const routeNo = String(item['Rout No']).trim();

            if (!code || code === 'null' || code === 'undefined' || code === 'Kod') continue;

            // Network dönüşümü (BLD -> BELEDİYE)
            if (network === 'BLD') {
                network = 'BELEDİYE';
            }

            const { data, error } = await supabase
                .from('inventory_items')
                .update({
                    network: network,
                    route_no: routeNo === 'nan' ? null : routeNo
                })
                .eq('code', code)
                .select();

            if (error) {
                console.error(`✗ Hata (${code}):`, error.message);
            } else if (data && data.length > 0) {
                updatedCount++;
                console.log(`✓ Güncellendi: ${code} (NW: ${network}, R: ${routeNo})`);
            } else {
                noMatchCount++;
            }
        }

        console.log('\n=== SENKRONİZASYON ÖZETİ ===');
        console.log(`Güncellenen Kayıt: ${updatedCount}`);
        console.log(`Bulunamayan Kod: ${noMatchCount}`);
    } catch (err) {
        console.error('Kritik hata:', err);
    }
}

syncExcelToSupabase();
