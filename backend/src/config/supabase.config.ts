import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://slanoowprgrcksfqrgak.supabase.co';
// Fallback to the known working Service Role Key if env var fails
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.bawYE2ig0yEmje8bAEvD9qcrngcmI0r2qV61OeLGu-M';

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
