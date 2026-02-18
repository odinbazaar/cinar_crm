
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MailService } from './mail/mail.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const mailService = app.get(MailService);
    const configService = app.get(ConfigService);

    const aliUser = 'ali@izmiracikhavareklam.com';
    const aliPass = configService.get<string>('ALI_MAIL_PASS');

    console.log(`Testing mail for ${aliUser} with password from config...`);

    try {
        await mailService.sendMail(
            'odindev@gmail.com', // Test recipient
            'Test Email from Ali',
            '<h1>Hello</h1><p>This is a test email.</p>',
            'Hello, this is a test email.',
            undefined,
            aliUser
        );
        console.log('✅ Mail sent successfully!');
    } catch (error) {
        console.error('❌ Mail sending failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
    } finally {
        await app.close();
    }
}

bootstrap();
