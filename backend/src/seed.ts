import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo'
);

async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Hash password for all test users
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('🔐 Password hashed successfully');

        // 1. Insert test users (skip delete to avoid permission issues)
        console.log('\n👥 Creating test users...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .insert([
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
            ])
            .select();

        if (usersError) {
            console.error('❌ Error creating users:', usersError);
            throw usersError;
        }

        console.log('✅ Created users:', users?.map(u => u.email).join(', '));

        console.log('\n✨ Database seeding completed successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('   Email: admin@cinar.com');
        console.log('   Password: admin123');
        console.log('\n   Email: pm@cinar.com');
        console.log('   Password: admin123');
        console.log('\n   Email: designer@cinar.com');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase()
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
