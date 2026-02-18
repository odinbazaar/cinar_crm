
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MailService } from './mail/mail.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const mailService = app.get(MailService);
    const configService = app.get(ConfigService);

    const testUser = 'pazarlama@izmiracikhavareklam.com';

    console.log(`Testing mail for ${testUser}...`);

    try {
        await mailService.sendMail(
            'odindev@gmail.com', // Test recipient
            'Test Email from Pazarlama',
            '<h1>Hello</h1><p>This is a test email from Pazarlama.</p>',
            'Hello, this is a test email from Pazarlama.',
            undefined,
            testUser
        );
        console.log('✅ Mail sent successfully!');
    } catch (error) {
        console.error('❌ Mail sending failed:', error.message);
    } finally {
        await app.close();
    }
}

bootstrap();
