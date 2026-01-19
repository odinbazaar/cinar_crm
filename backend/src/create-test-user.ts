import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

async function createTestUser() {
    const urls = ['https://laltmysfkyppkqykggmh.supabase.co', 'https://laltmysfkyppkqykggmh.supabase.co'];
    const keys = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU'
    ];

    const email = 'test@test.com';
    const password = 'Password123!';
    const hash = await bcrypt.hash(password, 10);

    for (let i = 0; i < 2; i++) {
        console.log(`Adding test user to DB${i + 1}...`);
        const supabase = createClient(urls[i], keys[i]);
        const { error } = await supabase.from('users').upsert({
            email,
            password_hash: hash,
            first_name: 'Test',
            last_name: 'User',
            role: 'ADMIN'
        }, { onConflict: 'email' });

        if (error) console.error(error);
        else console.log(`✅ User added to DB${i + 1}`);
    }
}

createTestUser();
