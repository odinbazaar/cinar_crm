import * as nodemailer from 'nodemailer';

const config = {
    host: 'smtp.yandex.com.tr',
    port: 465,
    secure: true,
    auth: {
        user: 'Rezervasyon@izmiracikhavareklam.com',
        pass: 'Reziar.075',
    },
};

async function testMail() {
    const transporter = nodemailer.createTransport(config);

    try {
        console.log('⏳ Verifying transporter...');
        await transporter.verify();
        console.log('✅ Connection verified!');

        console.log('⏳ Sending test email...');
        const info = await transporter.sendMail({
            from: '"Çınar CRM Test" <Rezervasyon@izmiracikhavareklam.com>',
            to: 'Rezervasyon@izmiracikhavareklam.com',
            subject: 'SMTP Bağlantı Testi',
            text: 'Bu bir test e-postasıdır.',
            html: '<b>Bu bir test e-postasıdır.</b>',
        });

        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Error testing mail:', error);
    }
}

testMail();
