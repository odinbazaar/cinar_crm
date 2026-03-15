import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import supabase from '../config/supabase.config';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BookingRemindersService {
    private readonly logger = new Logger(BookingRemindersService.name);

    constructor(private readonly mailService: MailService) { }

    // Her gün saat 09:00'da çalışır
    @Cron('0 9 * * *', { timeZone: 'Europe/Istanbul' })
    async checkExpiringBookings() {
        this.logger.log('🔔 Biten rezervasyonlar kontrol ediliyor (3 gün kala)...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const targetDay = new Date(today);
        targetDay.setDate(targetDay.getDate() + 3);

        const targetStart = new Date(targetDay);
        targetStart.setHours(0, 0, 0, 0);

        const targetEnd = new Date(targetDay);
        targetEnd.setHours(23, 59, 59, 999);

        this.logger.log(`📅 Hedef tarih: ${targetStart.toISOString()} - ${targetEnd.toISOString()}`);

        // 3 gün sonra biten aktif rezervasyonları getir
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .in('status', ['KESİN', 'OPTION'])
            .gte('end_date', targetStart.toISOString())
            .lte('end_date', targetEnd.toISOString());

        if (error) {
            this.logger.error('❌ Rezervasyon sorgusu hatası:', error.message);
            return;
        }

        if (!bookings || bookings.length === 0) {
            this.logger.log('ℹ️ 3 gün içinde biten rezervasyon bulunamadı.');
            return;
        }

        this.logger.log(`📋 ${bookings.length} adet rezervasyon bulundu. Bildirimler gönderiliyor...`);

        // Her rezervasyon için bildiri gönder
        for (const booking of bookings) {
            await this.sendExpiryNotification(booking);
        }
    }

    private async sendExpiryNotification(booking: any) {
        try {
            // Müşteri bilgisini al
            let clientEmail: string | null = null;
            let clientName = booking.brand_name || booking.brand_option_1 || 'Müşteri';
            let clientPhone: string | null = null;

            if (booking.client_id) {
                const { data: client } = await supabase
                    .from('clients')
                    .select('company_name, email, contact_email, contact_person, phone')
                    .eq('id', booking.client_id)
                    .single();

                if (client) {
                    clientName = client.company_name || clientName;
                    clientEmail = client.contact_email || client.email || null;
                    clientPhone = client.phone || null;
                }
            }

            // Envanter bilgisini al
            let locationInfo = 'Bilinmiyor';
            if (booking.inventory_item_id) {
                const { data: item } = await supabase
                    .from('inventory_items')
                    .select('code, district, neighborhood, address')
                    .eq('id', booking.inventory_item_id)
                    .single();

                if (item) {
                    locationInfo = `${item.code} - ${item.district}${item.neighborhood ? '/' + item.neighborhood : ''}`;
                    if (item.address) locationInfo += ` (${item.address})`;
                }
            }

            const endDate = new Date(booking.end_date);
            const formattedEndDate = endDate.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });

            const subject = `Rezervasyon Bitiş Bildirimi - ${clientName} - ${locationInfo}`;

            const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
        📋 Rezervasyon Bitiş Bildirimi
      </h1>
      <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">
        İzmir Açık Hava Reklam
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 35px 40px;">
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px;">
        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
          ⚠️ Bu rezervasyon <strong>3 gün</strong> içinde sona erecek.
        </p>
      </div>

      <h2 style="color: #1e3a5f; font-size: 18px; margin: 0 0 20px;">Rezervasyon Detayları</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #6b7280; font-size: 13px; width: 40%;">Firma / Marka</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1f2937; font-size: 14px; font-weight: 600;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #6b7280; font-size: 13px;">Konum</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1f2937; font-size: 14px; font-weight: 600;">${locationInfo}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #6b7280; font-size: 13px;">Başlangıç Tarihi</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1f2937; font-size: 14px;">${new Date(booking.start_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #6b7280; font-size: 13px;">Bitiş Tarihi</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #dc2626; font-size: 14px; font-weight: 700;">📅 ${formattedEndDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #6b7280; font-size: 13px;">Durum</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">
            <span style="background-color: ${booking.status === 'KESİN' ? '#d1fae5' : '#fef9c3'}; color: ${booking.status === 'KESİN' ? '#065f46' : '#713f12'}; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">
              ${booking.status}
            </span>
          </td>
        </tr>
        ${booking.notes ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Notlar</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 13px;">${booking.notes}</td>
        </tr>
        ` : ''}
      </table>

      <div style="margin-top: 28px; background-color: #eff6ff; border-radius: 8px; padding: 16px 20px;">
        <p style="margin: 0; color: #1e40af; font-size: 13px;">
          💡 <strong>Hatırlatma:</strong> Rezervasyonun uzatılması veya yenilenmesi için lütfen ekibimizle iletişime geçin.
        </p>
        ${clientPhone ? `<p style="margin: 8px 0 0; color: #3b82f6; font-size: 13px;">📞 ${clientPhone}</p>` : ''}
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 20px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        Bu e-posta İzmir Açık Hava Reklam CRM sistemi tarafından otomatik olarak gönderilmiştir.
      </p>
      <p style="margin: 6px 0 0; color: #9ca3af; font-size: 12px;">
        © 2026 İzmir Açık Hava Reklam Ajansı
      </p>
    </div>
  </div>
</body>
</html>`;

            // Dahili bildirim: rezervasyon@izmiracikhavareklam.com'a gönder
            await this.mailService.sendMail(
                'rezervasyon@izmiracikhavareklam.com',
                subject,
                html,
                undefined,
                undefined,
                'rezervasyon@izmiracikhavareklam.com'
            );

            this.logger.log(`✅ Bildirim gönderildi: ${clientName} - ${locationInfo} (bitiş: ${formattedEndDate})`);

            // Eğer müşterinin e-postası varsa ona da gönder
            if (clientEmail) {
                await this.mailService.sendMail(
                    clientEmail,
                    subject,
                    html,
                    undefined,
                    undefined,
                    'rezervasyon@izmiracikhavareklam.com'
                );
                this.logger.log(`✅ Müşteriye de gönderildi: ${clientEmail}`);
            }

        } catch (err) {
            this.logger.error(`❌ Bildirim gönderilemedi (booking: ${booking.id}):`, err.message);
        }
    }

    // Manuel tetikleme için endpoint'ten çağrılabilir
    async triggerManualCheck() {
        await this.checkExpiringBookings();
        return { status: 'ok', message: 'Rezervasyon bitiş bildirimleri kontrol edildi.' };
    }
}
