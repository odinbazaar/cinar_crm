import * as nodemailer from 'nodemailer';

const config = {
    host: 'smtp.yandex.com.tr',
    port: 465,
    secure: true,
    auth: {
        user: 'ali@izmiracikhavareklam.com',
        pass: 'Reziar.075',
    },
};

async function testAliMail() {
    const transporter = nodemailer.createTransport(config);

    try {
        console.log('⏳ Verifying ali@ transporter...');
        await transporter.verify();
        console.log('✅ ali@ Connection verified!');

        console.log('⏳ Sending test email from ali@...');
        const info = await transporter.sendMail({
            from: '"Çınar Reklam - Ali" <ali@izmiracikhavareklam.com>',
            to: 'Rezervasyon@izmiracikhavareklam.com',
            subject: 'Ali Mail Bağlantı Testi',
            text: 'Bu ali@ hesabından gönderilen bir test e-postasıdır.',
            html: '<b>Bu ali@ hesabından gönderilen bir test e-postasıdır.</b>',
        });

        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Error testing ali mail:', error);
    }
}

testAliMail();
