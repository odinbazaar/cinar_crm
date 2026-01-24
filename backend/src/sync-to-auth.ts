import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncUsers() {
    console.log('🔄 Fetching users from public.users table...');
    const { data: users, error: fetchError } = await supabase.from('users').select('*');

    if (fetchError) {
        console.error('❌ Error fetching users:', fetchError);
        return;
    }

    console.log(`📋 Found ${users?.length} users. Syncing to Supabase Auth...`);

    for (const user of users || []) {
        console.log(`➡️ Syncing: ${user.email} (${user.first_name} ${user.last_name})`);

        // Check if user already exists in auth
        // Note: auth.admin.listUsers could be used but let's just try to create and handle "already exists"

        // We use the email/code as password if it was created with the new system, 
        // or we don't know the password if it's old. 
        // For old users, we might need to set a temporary password or let them reset.
        // But the user said "Giriş Kodu" system.

        const password = user.email; // Assuming the new system or a known default

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            id: user.id || undefined, // Try to keep existing ID if possible
            email: user.email.includes('@') ? user.email : `${user.email}@cinarcrm.com`,
            password: password,
            email_confirm: true,
            user_metadata: {
                first_name: user.first_name,
                last_name: user.last_name
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log(`ℹ️  User ${user.email} already exists in Auth.`);
            } else {
                console.error(`❌ Error creating Auth user ${user.email}:`, authError.message);
            }
        } else {
            console.log(`✅ User ${user.email} synced successfully.`);

            // If the ID in public.users was different or null, we might need to update it
            if (user.id !== authUser.user.id) {
                await supabase.from('users').update({ id: authUser.user.id }).eq('email', user.email);
            }
        }
    }

    console.log('🏁 Sync completed.');
}

syncUsers().catch(console.error);
