// Test bcrypt hash verification
const bcrypt = require('bcrypt');

async function testHash() {
    const password = 'admin123';
    const hashInDatabase = '$2b$10$2Wj.74WusgXIVAt/q1hs5.CMT28L/S9j/bwWt4btLaheKcR/ZH/aG';

    console.log('\n=================================');
    console.log('Testing bcrypt verification');
    console.log('=================================');
    console.log('Password:', password);
    console.log('Hash in DB:', hashInDatabase);

    const isValid = await bcrypt.compare(password, hashInDatabase);
    console.log('Is Valid:', isValid);

    if (!isValid) {
        console.log('\n❌ Hash does not match!');
        console.log('Generating new hash...\n');

        const newHash = await bcrypt.hash(password, 10);
        console.log('New Hash:', newHash);
        console.log('\nUPDATE SQL:');
        console.log(`UPDATE users SET password_hash = '${newHash}' WHERE email = 'admin@cinar.com';`);
    } else {
        console.log('\n✅ Hash is valid! Login should work.');
    }
    console.log('=================================\n');
}

testHash();
