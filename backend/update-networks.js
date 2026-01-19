const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateNetworks() {
    try {
        const rawData = fs.readFileSync('networks.json', 'utf8');
        const networks = JSON.parse(rawData);

        console.log(`Found ${networks.length} potential items to update.`);

        let updatedCount = 0;
        let errorCount = 0;
        let noMatchCount = 0;

        for (const item of networks) {
            const code = String(item.Kod).trim();
            let network = String(item.Network).trim();

            if (!code || code === 'null' || code === 'undefined' || code === 'Kod') continue;

            // Convert network values
            if (network === 'BLD') {
                network = 'BELEDİYE';
            }

            const { data, error } = await supabase
                .from('inventory_items')
                .update({ network: network })
                .eq('code', code)
                .select();

            if (error) {
                console.error(`✗ Error updating ${code}:`, error.message);
                errorCount++;
            } else if (data && data.length > 0) {
                updatedCount++;
                console.log(`✓ Updated ${code} -> Network ${network}`);
            } else {
                noMatchCount++;
            }
        }

        console.log('\n=== Summary ===');
        console.log(`Updated: ${updatedCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log(`No Match: ${noMatchCount}`);
    } catch (err) {
        console.error('Fatal error:', err);
    }
}

updateNetworks();
