import supabase from './config/supabase.config';

async function testSchema() {
    const { data, error } = await supabase.from('public.users' as any).select('*').limit(1);
    if (error) {
        console.error('Error public.users:', error.message);
    } else {
        console.log('Success public.users');
    }
}

testSchema();
