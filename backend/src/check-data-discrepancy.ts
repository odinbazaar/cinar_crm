import { createClient } from '@supabase/supabase-js';

async function checkReservations() {
    const url = 'https://laltmysfkyppkqykggmh.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';
    const supabase = createClient(url, key);

    console.log('--- Checking Public Schema ---');
    const { count: publicBookingsCount, error: publicError } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    console.log('public.bookings count:', publicError ? publicError.message : publicBookingsCount);

    const { count: publicInvCount, error: invError } = await supabase.from('inventory_items').select('*', { count: 'exact', head: true });
    console.log('public.inventory_items count:', invError ? invError.message : publicInvCount);

    console.log('--- Checking Halk Schema ---');
    const halkSupabase = createClient(url, key, { db: { schema: 'halk' } });

    const { count: rezCount, error: err1 } = await halkSupabase.from('rezervasyonlar').select('*', { count: 'exact', head: true });
    console.log('halk.rezervasyonlar count:', err1 ? err1.message : rezCount);

    const { count: invHalkCount, error: err2 } = await halkSupabase.from('envanter_ürünleri').select('*', { count: 'exact', head: true });
    console.log('halk.envanter_ürünleri count:', err2 ? err2.message : invHalkCount);
}

checkReservations();
