import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPassword() {
    const email = 'ali@izmiracikhavareklam.com';
    const newPassword = '123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`🔧 Updating password for ${email} to "123"`);

    const { data, error } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('email', email)
        .select();

    if (error) {
        console.error('❌ Error updating password:', error);
    } else {
        console.log('✅ Password updated successfully in DB.');

        // Also update in Auth if user exists there
        const { data: authUser } = await supabase.auth.admin.listUsers();
        const userInAuth = authUser?.users.find(u => u.email === email);

        if (userInAuth) {
            const { error: authError } = await supabase.auth.admin.updateUserById(userInAuth.id, {
                password: newPassword
            });
            if (authError) console.error('❌ Auth update error:', authError.message);
            else console.log('✅ Password updated successfully in Auth.');
        }
    }
}

fixPassword().catch(console.error);
