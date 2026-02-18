
import * as nodemailer from 'nodemailer';

async function testPassword(host: string, password: string) {
    const transporter = nodemailer.createTransport({
        host: host,
        port: 465,
        secure: true,
        auth: {
            user: 'ayse@izmiracikhavareklam.com',
            pass: password,
        }
    });

    try {
        await transporter.verify();
        return true;
    } catch (error) {
        return false;
    } finally {
        transporter.close();
    }
}

async function run() {
    const hosts = ['smtp.yandex.com.tr', 'smtp.yandex.com'];
    const pws = ['ayse4310076', 'Pazarlamaiar2026.', 'Ahh577557.'];

    for (const host of hosts) {
        for (const pw of pws) {
            console.log(`Testing [${host}]: ${pw}...`);
            if (await testPassword(host, pw)) {
                console.log(`✅ SUCCESS: ${host} / ${pw}`);
                process.exit(0);
            }
        }
    }
    console.log('❌ All attempts failed.');
}

run();
