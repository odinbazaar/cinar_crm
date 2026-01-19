const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co',
    // Use SERVICE_ROLE key for seeding (has admin permissions)
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo'
);

async function seed() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        console.log('🔐 Password hashed successfully');

        // Create test users
        console.log('\n👥 Creating test users...');

        const users = [
            {
                email: 'admin@cinar.com',
                password_hash: hashedPassword,
                first_name: 'Admin',
                last_name: 'User',
                role: 'ADMIN',
                status: 'ACTIVE',
                phone: '+90 532 123 4567',
                hourly_rate: 150.00
            },
            {
                email: 'pm@cinar.com',
                password_hash: hashedPassword,
                first_name: 'Project',
                last_name: 'Manager',
                role: 'PROJECT_MANAGER',
                status: 'ACTIVE',
                phone: '+90 532 234 5678',
                hourly_rate: 120.00
            },
            {
                email: 'designer@cinar.com',
                password_hash: hashedPassword,
                first_name: 'Designer',
                last_name: 'User',
                role: 'DESIGNER',
                status: 'ACTIVE',
                phone: '+90 532 345 6789',
                hourly_rate: 100.00
            }
        ];

        for (const user of users) {
            const { data, error } = await supabase
                .from('users')
                .insert([user])
                .select();

            if (error) {
                if (error.code === '23505') {
                    console.log(`⚠️  User ${user.email} already exists, skipping...`);
                } else {
                    console.error(`❌ Error creating ${user.email}:`, error.message);
                }
            } else {
                console.log(`✅ Created user: ${user.email}`);
            }
        }

        console.log('\n✨ Database seeding completed!');
        console.log('\n📝 Test Credentials:');
        console.log('   Email: admin@cinar.com');
        console.log('   Password: admin123');
        console.log('\n   Email: pm@cinar.com');
        console.log('   Password: admin123');
        console.log('\n   Email: designer@cinar.com');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('\n❌ Seed error:', error);
        process.exit(1);
    }
}

seed()
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
