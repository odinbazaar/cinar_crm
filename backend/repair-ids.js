const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function repair() {
    console.log('🔍 Fetching Auth users...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Error fetching auth users:', authError);
        return;
    }

    const authUsers = authData.users;
    console.log(`Found ${authUsers.length} users in Auth.`);

    for (const authUser of authUsers) {
        console.log(`Checking user: ${authUser.email}`);

        // Find user by email in public.users
        const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('email', authUser.email)
            .maybeSingle();

        if (dbError) {
            console.error(`Error fetching DB user ${authUser.email}:`, dbError);
            continue;
        }

        if (dbUser) {
            if (dbUser.id !== authUser.id) {
                console.log(`⚠️ ID Mismatch for ${authUser.email}: DB(${dbUser.id}) vs Auth(${authUser.id})`);

                // We need to update the ID in public.users. 
                // Since ID is PK, we might need to delete and re-insert or use a temp approach if there are FKs.
                // For now, let's try a direct update. Supabase allows this if no FK constraints block it.

                // IMPORTANT: If we update the ID, any other tables referencing this ID will break 
                // unless we have ON UPDATE CASCADE.

                try {
                    // Step 1: Delete old record
                    const { error: delError } = await supabase.from('users').delete().eq('id', dbUser.id);
                    if (delError) throw delError;

                    // Step 2: Insert with new ID
                    const { error: insError } = await supabase.from('users').insert([{
                        ...dbUser,
                        id: authUser.id
                    }]);
                    if (insError) throw insError;

                    console.log(`✅ Fixed ID for ${authUser.email}`);
                } catch (e) {
                    console.error(`❌ Failed to fix ID for ${authUser.email}:`, e.message);
                }
            } else {
                console.log(`✅ ID matches for ${authUser.email}`);
            }
        } else {
            console.log(`ℹ️ User ${authUser.email} not found in DB table.`);
        }
    }
    console.log('🏁 Repair completed.');
}

repair();
