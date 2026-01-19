import { createClient } from '@supabase/supabase-js';

async function checkEmails() {
    const configs = [
        {
            name: 'DB1 (laltmysf...)',
            url: 'https://laltmysfkyppkqykggmh.supabase.co',
            key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU'
        },
        {
            name: 'DB2 (slanoow...)',
            url: 'https://laltmysfkyppkqykggmh.supabase.co',
            key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU'
        }
    ];

    for (const conf of configs) {
        console.log(`--- ${conf.name} ---`);
        const supabase = createClient(conf.url, conf.key);
        const { data, error } = await supabase.from('users').select('email, role');
        if (error) {
            console.error('Error:', error);
        } else {
            data.forEach(u => {
                console.log(`Email: [${u.email}] Role: ${u.role}`);
            });
        }
    }
}

checkEmails();
