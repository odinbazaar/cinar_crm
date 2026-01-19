import { createClient } from '@supabase/supabase-js';

async function searchAli() {
    const url = 'https://laltmysfkyppkqykggmh.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';
    const supabase = createClient(url, key);

    console.log('Searching for users related to "ali"...');
    const { data, error } = await supabase
        .from('users')
        .select('id, email, password_hash, role');

    if (error) {
        console.error(error);
    } else {
        data.forEach(u => {
            if (u.email.toLowerCase().includes('al')) {
                console.log(`Match: [${u.email}] Role: ${u.role} HashLen: ${u.password_hash?.length}`);
            }
        });
    }
}

searchAli();
