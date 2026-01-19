import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

async function checkHashesSeparate() {
    const configs = [
        {
            name: 'DB1 (laltmy...)',
            url: 'https://laltmysfkyppkqykggmh.supabase.co',
            key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU'
        },
        {
            name: 'DB2 (slanoow...)',
            url: 'https://laltmysfkyppkqykggmh.supabase.co',
            key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU'
        }
    ];

    const password = 'Cinarcrm123!';

    for (const conf of configs) {
        console.log(`--- Testing ${conf.name} ---`);
        const supabase = createClient(conf.url, conf.key);
        const { data: user, error } = await supabase
            .from('users')
            .select('password_hash')
            .eq('email', 'ali@izmiracikhavareklam.com')
            .single();

        if (error) {
            console.log(`User not found in ${conf.name}`);
        } else {
            const isValid = await bcrypt.compare(password, user.password_hash);
            console.log(`Hash: ${user.password_hash.substring(0, 15)}...`);
            console.log(`Is valid? ${isValid}`);
        }
    }
}

checkHashesSeparate();
