import supabase from './config/supabase.config';

async function checkAllAlis() {
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', 'ali%');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Users found:', JSON.stringify(users, null, 2));
    }
}

checkAllAlis();
