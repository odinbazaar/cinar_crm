import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private mailConfig: any;

    constructor(private configService: ConfigService) {
        const port = Number(this.configService.get<number>('MAIL_PORT') || 465);
        this.mailConfig = {
            host: this.configService.get<string>('MAIL_HOST'),
            port: port,
            secure: port === 465,
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            },
            tls: {
                // TODO: Review for production. Currently disabled to allow connections with some mail providers
                rejectUnauthorized: false
            },
            // Yandex için önemli ayarlar
            pool: false, // Bağlantı havuzunu devre dışı bırak
            maxConnections: 1,
            rateDelta: 1000,
            rateLimit: 5,
            connectionTimeout: 10000, // 10 saniye
            greetingTimeout: 10000,
            socketTimeout: 30000
        };

        this.logger.log(`📧 Mail config: ${this.mailConfig.host}:${this.mailConfig.port} (secure: ${this.mailConfig.secure})`);
        this.logger.log(`📧 Mail user: ${this.mailConfig.auth.user}`);
    }

    private createTransporter(auth?: { user: string; pass: string }): nodemailer.Transporter {
        const config = { ...this.mailConfig };
        if (auth) {
            config.auth = auth;
        }
        return nodemailer.createTransport(config);
    }

    async sendMail(to: string, subject: string, html: string, text?: string, attachments?: any[], fromEmail?: string) {
        const maxRetries = 3;
        let lastError: any;

        // Gönderici adresine göre kimlik doğrulama bilgilerini belirle
        let auth: { user: string; pass: string } | undefined = undefined;

        if (fromEmail) {
            const lowerFrom = fromEmail.toLowerCase();

            if (lowerFrom.includes('rezervasyon')) {
                const rezUser = this.configService.get<string>('REZERVASYON_MAIL_USER') || 'rezervasyon@izmiracikhavareklam.com';
                const rezPass = this.configService.get<string>('REZERVASYON_MAIL_PASS');
                if (rezPass) {
                    auth = { user: rezUser, pass: rezPass };
                    this.logger.log(`📧 Using Rezervasyon credentials for sending.`);
                } else {
                    throw new Error(`Rezervasyon hesabı için şifre (REZERVASYON_MAIL_PASS) .env dosyasında bulunamadı.`);
                }
            } else if (lowerFrom.includes('ali@izmiracikhavareklam.com') || lowerFrom.startsWith('ali@')) {
                const aliUser = 'ali@izmiracikhavareklam.com';
                const aliPass = this.configService.get<string>('ALI_MAIL_PASS');
                if (aliPass) {
                    auth = { user: aliUser, pass: aliPass };
                    this.logger.log(`📧 Using Ali credentials for sending.`);
                } else {
                    throw new Error(`Ali Bey hesabı için şifre (ALI_MAIL_PASS) .env dosyasında bulunamadı.`);
                }
            } else if (lowerFrom.includes('simge@izmiracikhavareklam.com') || lowerFrom.includes('simge@')) {
                const simgeUser = 'simge@izmiracikhavareklam.com';
                const simgePass = this.configService.get<string>('SIMGE_MAIL_PASS');
                if (simgePass) {
                    auth = { user: simgeUser, pass: simgePass };
                    this.logger.log(`📧 Using Simge credentials for sending.`);
                } else {
                    throw new Error(`Simge hesabı için şifre (SIMGE_MAIL_PASS) .env dosyasında bulunamadı.`);
                }
            } else if (lowerFrom.includes('ayse@izmiracikhavareklam.com') || lowerFrom.includes('ayse@')) {
                const ayseUser = 'ayse@izmiracikhavareklam.com';
                const aysePass = this.configService.get<string>('AYSE_MAIL_PASS');
                if (aysePass) {
                    auth = { user: ayseUser, pass: aysePass };
                    this.logger.log(`📧 Using Ayşe credentials for sending.`);
                } else {
                    throw new Error(`Ayşe hesabı için şifre (AYSE_MAIL_PASS) .env dosyasında bulunamadı.`);
                }
            } else if (lowerFrom.includes('can@izmiracikhavareklam.com') || lowerFrom.includes('can@')) {
                const canUser = 'can@izmiracikhavareklam.com';
                const canPass = this.configService.get<string>('CAN_MAIL_PASS');
                if (canPass) {
                    auth = { user: canUser, pass: canPass };
                    this.logger.log(`📧 Using Can credentials for sending.`);
                } else {
                    throw new Error(`Can Bey hesabı için şifre (CAN_MAIL_PASS) .env dosyasında bulunamadı.`);
                }
            }
        }

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const transporter = this.createTransporter(auth);

            try {
                // Gönderici formatını sadeleştiriyoruz (Yandex gibi sağlayıcılar için daha garanti)
                const defaultFrom = this.configService.get<string>('MAIL_FROM') || this.mailConfig.auth.user;
                const from = fromEmail ? fromEmail : defaultFrom;

                this.logger.log(`📧 Attempt ${attempt}/${maxRetries}: Sending email to ${to} from ${from}...`);

                const info = await transporter.sendMail({
                    from: from,
                    to: to,
                    subject: subject,
                    text: text || '',
                    html: html,
                    attachments: attachments || [],
                });

                this.logger.log(`✅ Email sent to ${to}: ${info.messageId}`);
                transporter.close();
                return info;
            } catch (error) {
                lastError = error;
                this.logger.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);
                transporter.close();

                // 454 hatası için bekle ve tekrar dene
                if (error.responseCode === 454 && attempt < maxRetries) {
                    const waitTime = attempt * 2000; // 2s, 4s, 6s
                    this.logger.log(`⏳ Waiting ${waitTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else if (attempt >= maxRetries) {
                    break;
                }
            }
        }

        this.logger.error(`❌ All ${maxRetries} attempts failed for ${to}:`, lastError);
        throw lastError;
    }

    // Example: Welcome email
    async sendWelcomeEmail(to: string, name: string) {
        const subject = 'İzmir Açıkhava CRM Sistemine Hoş Geldiniz';
        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Merhaba ${name},</h2>
        <p>İzmir Açıkhava CRM sistemine kaydınız başarıyla tamamlandı.</p>
        <p>Aşağıdaki bağlantıyı kullanarak sisteme giriş yapabilirsiniz:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.configService.get('FRONTEND_URL')}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Sisteme Giriş Yap</a>
        </div>
        <p style="color: #666; font-size: 14px;">Eğer bu e-postayı yanlışlıkla aldıysanız, lütfen dikkate almayınız.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">© 2026 İzmir Açıkhava Reklam Ajansı</p>
      </div>
    `;
        return this.sendMail(to, subject, html);
    }
}
