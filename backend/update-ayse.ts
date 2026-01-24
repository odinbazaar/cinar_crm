
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAyse() {
    const email = 'ayse@izmiracikhavareklam.com';
    const password = 'ayse4310076';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Updating user ${email}...`);

    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (fetchError || !user) {
        console.log('User not found, creating...');
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                email: email,
                password_hash: hashedPassword,
                first_name: 'Ayşe',
                last_name: 'Hanım',
                role: 'ADMIN',
                status: 'ACTIVE'
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating user:', createError);
        } else {
            console.log('User created successfully:', newUser.email);
        }
    } else {
        console.log('User found, updating password...');
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
                password_hash: hashedPassword,
                role: 'ADMIN' // Making sure she is an admin
            })
            .eq('email', email)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating user:', updateError);
        } else {
            console.log('User updated successfully:', updatedUser.email);
        }
    }
}

updateAyse();
