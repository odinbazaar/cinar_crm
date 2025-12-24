
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from absolute path since we are running with ts-node
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function resetAdminPassword() {
    console.log('🔄 Resetting admin password...');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('❌ Missing environment variables');
        return;
    }

    try {
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('users')
            .update({ password_hash: hashedPassword })
            .eq('email', 'admin@cinar.com')
            .select();

        if (error) {
            console.error('❌ Error updating admin:', error);
            throw error;
        }

        console.log('✅ Admin password reset successfully to: admin123');
        console.log('User data:', data);

    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    }
}

resetAdminPassword();
