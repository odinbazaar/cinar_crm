import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

async function checkHashesSeparate() {
    const urls = ['https://laltmysfkyppkqykggmh.supabase.co', 'https://laltmysfkyppkqykggmh.supabase.co'];
    const keys = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU'
    ];

    for (let i = 0; i < 2; i++) {
        const supabase = createClient(urls[i], keys[i]);
        const { data: user } = await supabase.from('users').select('password_hash').eq('email', 'ali@izmiracikhavareklam.com').single();
        if (user) {
            const v = await bcrypt.compare('Cinarcrm123!', user.password_hash);
            console.log(`DB${i + 1}: ${v ? 'VALID' : 'INVALID'}`);
        } else {
            console.log(`DB${i + 1}: NOT FOUND`);
        }
    }
}
checkHashesSeparate();
