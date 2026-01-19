const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixRequests() {
    // Get all requests with product_type 'other'
    const { data: requests, error } = await supabase
        .from('customer_requests')
        .select('*')
        .eq('product_type', 'other');

    if (error) {
        console.error(error);
        return;
    }

    console.log(`${requests.length} adet 'other' tipli talep bulundu.`);

    for (const req of requests) {
        // Try to extract product type from product_details
        let details = {};
        try {
            details = JSON.parse(req.product_details || '{}');
        } catch (e) { }

        // Default to BB if not found
        const newType = details.productType || 'BB';

        const { error: updateError } = await supabase
            .from('customer_requests')
            .update({ product_type: newType })
            .eq('id', req.id);

        if (updateError) {
            console.error(`Hata (${req.id}):`, updateError.message);
        } else {
            console.log(`✓ Düzeltildi: ${req.id} -> ${newType}`);
        }
    }

    console.log('Tamamlandı.');
}

fixRequests();
