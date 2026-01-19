import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

async function resetAliSimple() {
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

    const newPassword = '12345678';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    for (const conf of configs) {
        console.log(`Resetting Ali in ${conf.name} to 12345678...`);
        const supabase = createClient(conf.url, conf.key);
        const { error } = await supabase
            .from('users')
            .update({ password_hash: hashedPassword })
            .eq('email', 'ali@izmiracikhavareklam.com');

        if (error) {
            console.error(`Error in ${conf.name}:`, error);
        } else {
            console.log(`✅ Success in ${conf.name}`);
        }
    }
}

resetAliSimple();
