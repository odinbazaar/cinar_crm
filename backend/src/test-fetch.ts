async function test() {
    const url = 'https://laltmysfkyppkqykggmh.supabase.co/rest/v1/users';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo';

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', data);
}

test();
