import { createClient } from '@supabase/supabase-js';

async function checkHex() {
    const url = 'https://laltmysfkyppkqykggmh.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';
    const supabase = createClient(url, key);

    const { data } = await supabase.from('users').select('email').eq('role', 'ADMIN');
    if (data) {
        data.forEach(u => {
            console.log(`Email: ${u.email}`);
            for (let i = 0; i < u.email.length; i++) {
                console.log(`${u.email[i]} -> ${u.email.charCodeAt(i)}`);
            }
        });
    }
}

checkHex();
