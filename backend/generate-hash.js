// Generate bcrypt hash for password
const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);

  console.log('\n=================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('=================================\n');
  console.log('SQL to update user:');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@cinar.com';`);
  console.log('=================================\n');
}

generateHash();
