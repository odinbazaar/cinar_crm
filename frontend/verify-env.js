// Frontend Environment Variable Verification
// Bu dosyayı browser console'da çalıştırarak environment variable'ları kontrol edebilirsiniz

console.log('🔍 Frontend Environment Variables Check\n');

const envVars = {
    'API URL': import.meta.env.VITE_API_URL,
    'Supabase URL': import.meta.env.VITE_SUPABASE_URL,
    'Supabase Anon Key': import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set (hidden)' : '❌ MISSING',
    'Company Name': import.meta.env.VITE_COMPANY_NAME,
    'Company Phone': import.meta.env.VITE_COMPANY_PHONE,
    'Company Tax Office': import.meta.env.VITE_COMPANY_TAX_OFFICE,
    'Company Tax No': import.meta.env.VITE_COMPANY_TAX_NO,
    'Mode': import.meta.env.MODE,
    'Dev': import.meta.env.DEV,
    'Prod': import.meta.env.PROD,
};

console.table(envVars);

// Expected values for production
const expected = {
    'VITE_API_URL': 'https://backend.cinarcrm.online/api',
    'VITE_SUPABASE_URL': 'https://laltmysfkyppkqykggmh.supabase.co',
    'VITE_COMPANY_NAME': 'İZMİR AÇIK HAVA REKLAM SAN. VE TİC. LTD. ŞTİ.',
    'MODE': 'production',
    'PROD': true,
};

console.log('\n✅ Expected Production Values:');
console.table(expected);

// Check for mismatches
const mismatches = [];
if (import.meta.env.VITE_API_URL !== expected.VITE_API_URL) {
    mismatches.push('❌ API URL mismatch!');
}
if (import.meta.env.VITE_SUPABASE_URL !== expected.VITE_SUPABASE_URL) {
    mismatches.push('❌ Supabase URL mismatch!');
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    mismatches.push('❌ Supabase Anon Key missing!');
}
if (import.meta.env.MODE !== 'production') {
    mismatches.push('❌ Not in production mode!');
}

if (mismatches.length > 0) {
    console.log('\n⚠️ PROBLEMS FOUND:');
    mismatches.forEach(m => console.log(m));
    console.log('\n🔧 Solution: Rebuild frontend with correct .env.production file');
    console.log('   1. Update environment variables in Coolify');
    console.log('   2. Click "Restart Project" to rebuild');
    console.log('   3. Clear browser cache (CTRL+SHIFT+R)');
} else {
    console.log('\n✅ All environment variables are correct!');
}

export default envVars;
