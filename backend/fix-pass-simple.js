const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabaseUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    const email = 'ali@izmiracikhavareklam.com';
    const pass = '123456';
    const hash = await bcrypt.hash(pass, 10);

    console.log('Update DB...');
    const { error: dbError } = await supabase.from('users').update({ password_hash: hash }).eq('email', email);
    if (dbError) console.error(dbError);

    console.log('Update Auth...');
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const target = authUsers.users.find(u => u.email === email);
    if (target) {
        const { error: authError } = await supabase.auth.admin.updateUserById(target.id, { password: pass });
        if (authError) console.error(authError);
    }
    console.log('Done. Try logging in with email: ali@izmiracikhavareklam.com and password: 123456');
}

fix();
