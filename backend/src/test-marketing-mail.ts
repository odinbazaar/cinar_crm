import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env dosyasını yükle
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testMail() {
    const config = {
        host: process.env.MAIL_HOST || 'smtp.yandex.com.tr',
        port: Number(process.env.MAIL_PORT) || 587,
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
        from: process.env.MAIL_FROM || process.env.MAIL_USER
    };

    console.log('--- Mail Test Yapılandırması ---');
    console.log('Host:', config.host);
    console.log('Port:', config.port);
    console.log('User:', config.user);
    console.log('Secure:', config.port === 465);

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
            user: config.user,
            pass: config.pass,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('\nBağlantı doğrulanıyor...');
        await transporter.verify();
        console.log('✅ Bağlantı başarılı!');

        console.log('\nTest e-postası gönderiliyor...');
        const info = await transporter.sendMail({
            from: config.from,
            to: config.user, // Kendine gönder
            subject: 'Çınar CRM - Mail Testi',
            text: 'Bu bir test e-postasıdır.',
            html: '<b>Bu bir test e-postasıdır.</b>'
        });

        console.log('✅ E-posta gönderildi! Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Hata oluştu:');
        console.error(error);

        if (error.code === 'EAUTH') {
            console.log('\n--- ÇÖZÜM ÖNERİSİ ---');
            console.log('Kimlik doğrulama hatası (EAUTH) genellikle aşağıdakilerden kaynaklanır:');
            console.log('1. Şifre yanlış.');
            console.log('2. Yandex hesabında "Uygulama Şifreleri" (App Passwords) etkin değil.');
            console.log('3. Yandex ayarlarında POP3/IMAP/SMTP erişimi kapalı.');
        }
    }
}

testMail();
