import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
// Fallback to the known working Service Role Key if env var fails
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';

console.log('🔧 Initializing Supabase Client...');
console.log('   URL:', supabaseUrl);
// Only log length for security
console.log('   Key Length:', supabaseKey?.length || 0);

if (!supabaseKey) {
    console.error('❌ CRITICAL: Supabase Key is MISSING!');
}

export const supabase = createClient(
    supabaseUrl,
    supabaseKey || 'mock-key'
);

export default supabase;
