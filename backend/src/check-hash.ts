import supabase from './config/supabase.config';

async function checkHashExists() {
    const { data, error } = await supabase
        .from('users')
        .select('email, password_hash')
        .eq('email', 'ali@izmiracikhavareklam.com')
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Email:', data.email);
        console.log('Hash exists?', !!data.password_hash);
        console.log('Hash length:', data.password_hash?.length);
    }
}

checkHashExists();
