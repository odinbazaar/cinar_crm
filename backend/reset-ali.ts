import supabase from './src/config/supabase.config';
import * as bcrypt from 'bcrypt';

async function resetAli() {
    const hashedPassword = await bcrypt.hash('Cinarcrm123!', 10);
    const { error } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('email', 'ali@izmiracikhavareklam.com');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Ali password reset successfully');
    }
}

resetAli();
