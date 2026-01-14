import supabase from './config/supabase.config';
import * as bcrypt from 'bcrypt';

const users = [
    { email: 'ali@izmiracikhavareklam.com', first_name: 'Ali', last_name: 'Çınar', role: 'ADMIN' },
    { email: 'ayse@izmiracikhavareklam.com', first_name: 'Ayşe', last_name: 'Yılmaz', role: 'EMPLOYEE' },
    { email: 'muhasebe@izmiracikhavareklam.com', first_name: 'Muhasebe', last_name: 'Departmanı', role: 'MANAGER' },
    { email: 'info@izmiracikhavareklam.com', first_name: 'Bilgi', last_name: 'İşlem', role: 'ADMIN' },
    { email: 'goknil@izmiracikhavareklam.com', first_name: 'Göknil', last_name: 'Hanım', role: 'EMPLOYEE' },
    { email: 'simge@izmiracikhavareklam.com', first_name: 'Simge', last_name: 'Hanım', role: 'EMPLOYEE' },
    { email: 'can@izmiracikhavareklam.com', first_name: 'Can', last_name: 'Bey', role: 'EMPLOYEE' },
    { email: 'cihangir@izmiracikhavareklam.com', first_name: 'Cihangir', last_name: 'Bey', role: 'EMPLOYEE' },
];

const DEFAULT_PASSWORD = 'Cinarcrm123!';

async function seed() {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (const user of users) {
        console.log(`Processing user: ${user.email}`);

        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();

        if (checkError) {
            console.error(`Error checking user ${user.email}:`, checkError.message);
            continue;
        }

        if (existingUser) {
            console.log(`User ${user.email} already exists, skipping.`);
            continue;
        }

        const { error } = await supabase.from('users').insert([
            {
                ...user,
                password_hash: hashedPassword,
                status: 'ACTIVE',
            },
        ]);

        if (error) {
            console.error(`Error inserting user ${user.email}:`, error.message);
        } else {
            console.log(`User ${user.email} created successfully.`);
        }
    }
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
