import { createClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const supabase = createClient(fallbackUrl, fallbackKey);

async function checkFallback() {
    const { data: users, error } = await supabase
        .from('users')
        .select('email');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('FALLBACK_USERS:', JSON.stringify(users));
    }
}

checkFallback();
