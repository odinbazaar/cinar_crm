import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('proposals').select('proposal_number').order('created_at', { ascending: false }).limit(5);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Last Proposals:', data);
    }
}

test();
