// Create admin user via register endpoint
const axios = require('axios');

async function createAdmin() {
    try {
        console.log('🔄 Creating admin user via API...\n');

        const response = await axios.post('http://localhost:3000/api/auth/register', {
            email: 'admin@cinar.com',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN'
        });

        console.log('✅ Success!');
        console.log('User created:', response.data);
        console.log('\n📝 Login credentials:');
        console.log('Email: admin@cinar.com');
        console.log('Password: admin123');

    } catch (error) {
        if (error.response) {
            console.error('❌ Error:', error.response.data);

            // If user already exists, try to update password
            if (error.response.data.message?.includes('already exists') ||
                error.response.status === 409) {
                console.log('\n⚠️  User already exists. Try logging in with:');
                console.log('Email: admin@cinar.com');
                console.log('Password: admin123');
            }
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

createAdmin();
