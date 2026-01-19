import supabase from './config/supabase.config';

async function checkCasing() {
    const { data, error } = await supabase
        .from('users')
        .select('email');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Emails in DB (with exact casing):');
        data.forEach(u => {
            console.log(`'${u.email}'`);
        });
    }
}

checkCasing();
