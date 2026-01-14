async function register() {
    const url = 'http://localhost:3000/api/auth/register';

    const users = [
        { email: 'ali@izmiracikhavareklam.com', firstName: 'Ali', lastName: 'Çınar', role: 'ADMIN' },
        { email: 'ayse@izmiracikhavareklam.com', firstName: 'Ayşe', lastName: 'Yılmaz', role: 'EMPLOYEE' },
        { email: 'muhasebe@izmiracikhavareklam.com', firstName: 'Muhasebe', lastName: 'Departmanı', role: 'MANAGER' },
        { email: 'info@izmiracikhavareklam.com', firstName: 'Bilgi', lastName: 'İşlem', role: 'ADMIN' },
        { email: 'goknil@izmiracikhavareklam.com', firstName: 'Göknil', lastName: 'Hanım', role: 'EMPLOYEE' },
        { email: 'simge@izmiracikhavareklam.com', firstName: 'Simge', lastName: 'Hanım', role: 'EMPLOYEE' },
        { email: 'can@izmiracikhavareklam.com', firstName: 'Can', lastName: 'Bey', role: 'EMPLOYEE' },
        { email: 'cihangir@izmiracikhavareklam.com', firstName: 'Cihangir', lastName: 'Bey', role: 'EMPLOYEE' },
    ];

    for (const user of users) {
        console.log(`Registering ${user.email}...`);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...user,
                    password: 'Cinarcrm123!'
                })
            });
            const data = await res.json();
            console.log(`Status: ${res.status}, Data:`, data);
        } catch (e) {
            console.error(`Error:`, e.message);
        }
    }
}

register();
