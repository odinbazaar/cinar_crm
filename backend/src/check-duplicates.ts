import supabase from './config/supabase.config';

async function checkDuplicates() {
    const { data, error } = await supabase
        .from('users')
        .select('email');

    if (error) {
        console.error('Error:', error);
    } else {
        const emails = data.map(d => d.email);
        const duplicates = emails.filter((e, i) => emails.indexOf(e) !== i);
        console.log('Duplicate emails:', duplicates);
        console.log('All emails:', emails);
    }
}

checkDuplicates();
