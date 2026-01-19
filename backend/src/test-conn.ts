import { createClient } from '@supabase/supabase-js';

const url = 'https://laltmysfkyppkqykggmh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const client = createClient(url, key);

async function test() {
    const { data, error } = await client.from('users').select('id').limit(1);
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Success, found:', data.length, 'users');
    }
}

test();
