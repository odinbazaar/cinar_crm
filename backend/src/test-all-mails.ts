
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MailService } from './mail/mail.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const mailService = app.get(MailService);
    const configService = app.get(ConfigService);

    const testAccounts = [
        { email: 'pazarlama@izmiracikhavareklam.com', name: 'Pazarlama' },
        { email: 'ali@izmiracikhavareklam.com', name: 'Ali Çınar' },
        { email: 'simge@izmiracikhavareklam.com', name: 'Simge' },
        { email: 'ayse@izmiracikhavareklam.com', name: 'Ayşe' },
        { email: 'can@izmiracikhavareklam.com', name: 'Can' },
        { email: 'rezervasyon@izmiracikhavareklam.com', name: 'Rezervasyon' }
    ];

    console.log('🚀 Starting Mail Activation Tests...');

    for (const account of testAccounts) {
        console.log(`\n📧 Testing [${account.name}] (${account.email})...`);
        try {
            await mailService.sendMail(
                'odindev@gmail.com',
                `Test Email from ${account.name}`,
                `<h1>Hello</h1><p>This is a test email to verify ${account.name}'s account is active.</p>`,
                `Hello, this is a test email for ${account.name}.`,
                undefined,
                account.email
            );
            console.log(`✅ [${account.name}] is ACTIVE!`);
        } catch (error) {
            console.error(`❌ [${account.name}] FAILED:`, error.message);
        }
    }

    await app.close();
    console.log('\n🏁 Mail tests completed.');
}

bootstrap();
