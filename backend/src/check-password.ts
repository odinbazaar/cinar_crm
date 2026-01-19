import supabase from './config/supabase.config';
import * as bcrypt from 'bcrypt';

async function checkHash() {
    const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('email', 'ali@izmiracikhavareklam.com')
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    const password = 'Cinarcrm123!';
    const isValid = await bcrypt.compare(password, user.password_hash);

    console.log('User Found. Hash:', user.password_hash);
    console.log('Testing password: "Cinarcrm123!"');
    console.log('Is valid?', isValid);
}

checkHash();
