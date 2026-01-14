import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: this.configService.get<number>('MAIL_PORT') === 465, // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            },
        });

        // Verify connection on startup
        this.transporter.verify((error) => {
            if (error) {
                this.logger.error('❌ Mail server connection failed:', error);
            } else {
                this.logger.log('✅ Mail server is ready to send messages');
            }
        });
    }

    async sendMail(to: string, subject: string, html: string, text?: string) {
        try {
            const from = this.configService.get<string>('MAIL_FROM');
            const info = await this.transporter.sendMail({
                from: from,
                to: to,
                subject: subject,
                text: text || '',
                html: html,
            });

            this.logger.log(`📧 Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error(`❌ Failed to send email to ${to}:`, error);
            throw error;
        }
    }

    // Example: Welcome email
    async sendWelcomeEmail(to: string, name: string) {
        const subject = 'Çınar CRM Sistemine Hoş Geldiniz';
        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Merhaba ${name},</h2>
        <p>Çınar CRM sistemine kaydınız başarıyla tamamlandı.</p>
        <p>Aşağıdaki bağlantıyı kullanarak sisteme giriş yapabilirsiniz:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.configService.get('FRONTEND_URL')}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Sisteme Giriş Yap</a>
        </div>
        <p style="color: #666; font-size: 14px;">Eğer bu e-postayı yanlışlıkla aldıysanız, lütfen dikkate almayınız.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">© 2024 Çınar Reklam Ajansı</p>
      </div>
    `;
        return this.sendMail(to, subject, html);
    }
}
