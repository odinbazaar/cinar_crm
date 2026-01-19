import { createClient } from '@supabase/supabase-js';

async function checkAliHexDB2() {
    const url = 'https://laltmysfkyppkqykggmh.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';
    const supabase = createClient(url, key);

    const { data } = await supabase.from('users').select('email').eq('email', 'ali@izmiracikhavareklam.com');
    if (data && data.length > 0) {
        const email = data[0].email;
        console.log(`Email in DB2: ${email}`);
        for (let i = 0; i < email.length; i++) {
            console.log(`${email[i]} -> ${email.charCodeAt(i)}`);
        }
    } else {
        console.log('Ali NOT FOUND in DB2');
    }
}

checkAliHexDB2();
