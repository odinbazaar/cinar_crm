
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
        console.error(`❌ Attempt with "${password}" failed:`, error.message);
        return false;
    } finally {
        transporter.close();
    }
}

async function run() {
    const password = 'ayse431005';
    console.log(`Testing Ayşe's mail with password: ${password}...`);
    
    if (await testPassword(password)) {
        console.log(`✅ SUCCESS! Password "${password}" is correct.`);
    } else {
        console.log(`❌ Failed.`);
    }
}

run();
