import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

const fallbackUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const supabase = createClient(fallbackUrl, fallbackKey);

async function checkFallbackPassword() {
    const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('email', 'ali@izmiracikhavareklam.com')
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    const password = 'Cinarcrm123!';
    const isValid = await bcrypt.compare(password, user.password_hash);

    console.log('Fallback DB User Found.');
    console.log('Testing password: "Cinarcrm123!"');
    console.log('Is valid in Fallback?', isValid);
}

checkFallbackPassword();
