import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import supabase from '../config/supabase.config';
import { Proposal, CreateProposalDto, UpdateProposalDto } from './proposals.dto';
import PDFDocument from 'pdfkit';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProposalsService {
    constructor(
        private mailService: MailService,
        private configService: ConfigService
    ) { }
    async findAll(): Promise<Proposal[]> {
        const { data, error } = await supabase
            .from('proposals')
            .select(`
        *,
        client:clients(*),
        items:proposal_items(*)
      `)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as Proposal[];
    }

    async findOne(id: string): Promise<Proposal | null> {
        const { data, error } = await supabase
            .from('proposals')
            .select(`
        *,
        client:clients(*),
        items:proposal_items(*)
      `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('FindOne Error:', JSON.stringify(error));
            const logPath = path.join(process.cwd(), 'backend-error.txt');
            fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] FindOne Error: ${JSON.stringify(error)} \n`);
            return null;
        }
        return data as Proposal;
    }

    async create(createProposalDto: CreateProposalDto): Promise<Proposal> {
        try {
            const debugPath = path.join(process.cwd(), 'debug-input.json');
            fs.writeFileSync(debugPath, JSON.stringify(createProposalDto, null, 2));
            console.log('--- START PROPOSAL CREATION ---');

            // Generate proposal number
            const proposalNumber = await this.generateProposalNumber();
            console.log('Generated Proposal Number:', proposalNumber);

            // Calculate totals
            const subtotal = createProposalDto.subtotal ?? (createProposalDto.items || []).reduce(
                (sum, item) => {
                    const itemQty = Number(item.quantity) || 0;
                    const itemPrice = Number(item.unit_price) || 0;
                    const itemTotal = itemQty * itemPrice;
                    return sum + itemTotal;
                },
                0,
            );

            const taxRate = createProposalDto.tax_rate ?? 20; // Default 20% tax
            const taxAmount = createProposalDto.tax_amount ?? (subtotal * taxRate) / 100;
            const total = createProposalDto.total ?? (subtotal + taxAmount);

            console.log(`Totals: Sub(${subtotal}), Tax(${taxAmount}), Total(${total})`);

            // Fallback user if not provided or valid
            const validUserId = createProposalDto.created_by_id || '95959c2d-c5e1-454c-834f-3746d0a401c5';

            // Create proposal
            const { data: proposal, error: proposalError } = await supabase
                .from('proposals')
                .insert([
                    {
                        proposal_number: proposalNumber,
                        title: createProposalDto.title,
                        client_id: createProposalDto.client_id,
                        project_id: createProposalDto.project_id,
                        created_by_id: validUserId,
                        description: createProposalDto.description,
                        terms: createProposalDto.terms,
                        valid_until: createProposalDto.valid_until,
                        subtotal,
                        tax_rate: taxRate,
                        tax_amount: taxAmount,
                        total,
                        status: 'DRAFT',
                    },
                ])
                .select()
                .single();

            if (proposalError) {
                console.error('Supabase Proposal Insert Error:', proposalError);
                throw proposalError;
            }

            if (!proposal) {
                throw new Error('Supabase returned no data for inserted proposal');
            }

            console.log('Inserted Proposal ID:', proposal.id);

            // Create proposal items
            const items = createProposalDto.items.map((item, index) => {
                const qty = Number(item.quantity) || 0;
                const unitPrice = Number(item.unit_price) || 0;
                return {
                    proposal_id: proposal.id,
                    description: item.description || 'No description',
                    quantity: qty,
                    unit_price: unitPrice,
                    total: (item as any).total || (qty * unitPrice),
                    estimated_hours: (item as any).estimated_hours || 0,
                    hourly_rate: (item as any).hourly_rate || 0,
                    // metadata: item.metadata || {}, // REMARK: Removed due to missing DB column
                    order: index,
                };
            });

            console.log('Inserting Items:', JSON.stringify(items, null, 2));

            const { error: itemsError } = await supabase
                .from('proposal_items')
                .insert(items);

            if (itemsError) {
                console.error('Supabase Items Insert Error:', itemsError);
                throw itemsError;
            }

            const createdProposal = await this.findOne(proposal.id);
            if (!createdProposal) throw new Error('Failed to retrieve created proposal');

            // Otomatik bildirim oluştur
            try {
                await supabase.from('notifications').insert([{
                    type: 'proposal',
                    title: 'Yeni Teklif Oluşturuldu',
                    message: `${createProposalDto.title} başlıklı yeni teklif hazırlandı. Toplam: ₺${total.toLocaleString('tr-TR')}`,
                    related_id: proposal.id,
                    related_type: 'proposals'
                }]);
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
            }

            console.log('--- END PROPOSAL CREATION SUCCESS ---');
            return createdProposal;

        } catch (error) {
            console.error('--- PROPOSAL CREATION FAILED ---');
            console.error(error);
            const logPath = path.join(process.cwd(), 'backend-error.txt');
            fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] CRITICAL ERROR: ${error.message} \nStack: ${error.stack} \n`);
            throw error;
        }
    }

    async update(id: string, updateProposalDto: UpdateProposalDto): Promise<Proposal> {
        try {
            console.log(`--- START PROPOSAL UPDATE: ${id} ---`);

            let subtotal: number | undefined;
            let taxAmount: number | undefined;
            let total: number | undefined;
            const taxRate = 20;

            // Calculate new totals if items are provided
            if (updateProposalDto.items) {
                subtotal = updateProposalDto.items.reduce((sum, item) => {
                    const qty = Number(item.quantity) || 0;
                    const price = Number(item.unit_price) || 0;
                    return sum + (qty * price);
                }, 0);

                taxAmount = (subtotal * taxRate) / 100;
                total = subtotal + taxAmount;
            }

            // Update main proposal table
            const updateProps: any = { ...updateProposalDto };
            delete updateProps.items;

            if (subtotal !== undefined) {
                updateProps.subtotal = subtotal;
                updateProps.tax_amount = taxAmount;
                updateProps.total = total;
            }

            const { data: proposal, error: proposalError } = await supabase
                .from('proposals')
                .update(updateProps)
                .eq('id', id)
                .select()
                .single();

            if (proposalError) throw proposalError;

            // If items are provided, sync them
            if (updateProposalDto.items) {
                // Delete existing items
                const { error: deleteError } = await supabase
                    .from('proposal_items')
                    .delete()
                    .eq('proposal_id', id);

                if (deleteError) throw deleteError;

                // Insert new items
                const newItems = updateProposalDto.items.map((item, index) => ({
                    proposal_id: id,
                    description: item.description,
                    quantity: Number(item.quantity) || 0,
                    unit_price: Number(item.unit_price) || 0,
                    total: (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
                    estimated_hours: item.estimated_hours || 0,
                    hourly_rate: item.hourly_rate || 0,
                    // metadata: item.metadata || {},
                    order: index
                }));

                const { error: insertError } = await supabase
                    .from('proposal_items')
                    .insert(newItems);

                if (insertError) throw insertError;
            }

            const updatedProposal = await this.findOne(id);
            if (!updatedProposal) throw new Error('Failed to retrieve updated proposal');

            console.log(`--- END PROPOSAL UPDATE SUCCESS: ${id} ---`);
            return updatedProposal;

        } catch (error) {
            console.error(`--- PROPOSAL UPDATE FAILED: ${id} ---`);
            console.error(error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('proposals').delete().eq('id', id);

        if (error) throw new Error(error.message);
    }

    async updateStatus(id: string, status: string): Promise<Proposal> {
        const updateData: any = { status };

        if (status === 'SENT' && !updateData.sent_at) {
            updateData.sent_at = new Date();
        } else if (status === 'ACCEPTED') {
            updateData.accepted_at = new Date();
        }

        return this.update(id, updateData);
    }

    private async generateProposalNumber(): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        // Use a 5-digit random for better look
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');

        return `İAR-${year}${month}${day}-${random}`;
    }

    // Teklif e-posta ile gönder
    async generateProposalPDF(id: string): Promise<Buffer> {
        const proposal = await this.findOne(id);
        if (!proposal) throw new Error('Teklif bulunamadı');

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers: Buffer[] = [];

            // Font Yolları
            const regularFontPath = path.join(process.cwd(), 'src', 'assets', 'fonts', 'Roboto-Regular.ttf');
            const boldFontPath = path.join(process.cwd(), 'src', 'assets', 'fonts', 'Roboto-Bold.ttf');

            // Fontları kaydet (Hata durumunda Helvetica fallback kullan)
            try {
                if (fs.existsSync(regularFontPath) && fs.existsSync(boldFontPath)) {
                    doc.registerFont('CustomRegular', regularFontPath);
                    doc.registerFont('CustomBold', boldFontPath);
                    console.log('✅ Custom fonts registered successfully');
                } else {
                    console.warn('⚠️ Custom fonts not found, using Helvetica fallback');
                }
            } catch (fontError) {
                console.error('❌ Error registering fonts (corrupted format?):', fontError.message);
                console.warn('⚠️ Using Helvetica fallback due to font error');
            }

            // Override font usage if fallback is needed
            const safeFontRegular = (doc as any)._fontFamilies && (doc as any)._fontFamilies['CustomRegular'] ? 'CustomRegular' : 'Helvetica';
            const safeFontBold = (doc as any)._fontFamilies && (doc as any)._fontFamilies['CustomBold'] ? 'CustomBold' : 'Helvetica-Bold';

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const primaryColor = '#dc2626'; // Red-600
            const secondaryColor = '#4b5563'; // Gray-600

            // Header - Logo
            doc.rect(50, 45, 60, 60).fill(primaryColor);
            doc.fillColor('white').fontSize(24).font(safeFontBold).text('İAR', 50, 62, { width: 60, align: 'center' });

            // Brand
            doc.fillColor(primaryColor).fontSize(20).font(safeFontBold).text('İZMİR AÇIK HAVA', 125, 55);
            doc.fillColor('#6b7280').fontSize(10).font(safeFontRegular).text('REKLAM AJANSI', 125, 80, { characterSpacing: 2 });

            // Company Info
            const companyName = this.configService.get<string>('COMPANY_NAME') || 'İzmir Açıkhava Reklam Ajansı';
            doc.fillColor(secondaryColor).fontSize(8).font(safeFontRegular).text(companyName, 350, 50, { align: 'right' });
            doc.text('MANAS BULVARI ADALET MAHALLESİ NO:47 KAT:28 FOLKART TOWERS BAYRAKLI İZMİR', 350, 62, { align: 'right', width: 200 });
            doc.text('TEL: 0232 431 0 75 | FAKS: 0232 431 00 73', 350, 85, { align: 'right' });
            doc.text('KARŞIYAKA V.D. - 6490546546', 350, 97, { align: 'right' });

            doc.moveTo(50, 115).lineTo(550, 115).stroke('#e5e7eb');

            // Proposal Header
            doc.fillColor('#111827').fontSize(14).font(safeFontBold).text('BÜTÇE TEKLİF MEKTUBU', 50, 140, { align: 'center' });

            // Info Grid
            doc.fontSize(10).font(safeFontBold).text('TEKLİF NO:', 50, 180);
            doc.font(safeFontRegular).text(proposal.proposal_number, 150, 180);

            doc.font(safeFontBold).text('MÜŞTERİ:', 50, 200);
            doc.font(safeFontRegular).text((proposal as any).client?.company_name || '—', 150, 200);

            doc.font(safeFontBold).text('TARİH:', 350, 180);
            doc.font(safeFontRegular).text(new Date(proposal.created_at).toLocaleDateString('tr-TR'), 450, 180);

            doc.font(safeFontBold).text('GEÇERLİLİK:', 350, 200);
            doc.font(safeFontRegular).text(proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : '30 Gün', 450, 200);

            // Table Header
            const tableTop = 240;
            doc.rect(50, tableTop, 500, 25).fill(primaryColor);
            doc.fillColor('white').fontSize(10).font(safeFontBold);
            doc.text('ÜRÜN / HİZMET', 60, tableTop + 8);
            doc.text('ADET', 300, tableTop + 8, { width: 50, align: 'center' });
            doc.text('BİRİM FİYAT', 360, tableTop + 8, { width: 80, align: 'right' });
            doc.text('TOPLAM', 450, tableTop + 8, { width: 90, align: 'right' });

            // Table Rows
            let rowY = tableTop + 25;
            const items = (proposal as any).items || [];
            doc.fillColor('#374151').font(safeFontRegular);

            items.forEach((item: any) => {
                doc.text(item.description, 60, rowY + 10, { width: 230 });
                doc.text(item.quantity.toString(), 300, rowY + 10, { width: 50, align: 'center' });
                doc.text(`₺${(item.unit_price || 0).toLocaleString('tr-TR')}`, 360, rowY + 10, { width: 80, align: 'right' });
                doc.text(`₺${(item.total || 0).toLocaleString('tr-TR')}`, 450, rowY + 10, { width: 90, align: 'right' });

                rowY += 30;
                doc.moveTo(50, rowY).lineTo(550, rowY).stroke('#f3f4f6');
            });

            // Totals
            const totalsY = rowY + 20;
            doc.fillColor('#4b5563').fontSize(10);
            doc.text('Ara Toplam:', 350, totalsY);
            doc.fillColor('#111827').font(safeFontBold).text(`₺${proposal.subtotal.toLocaleString('tr-TR')}`, 450, totalsY, { width: 90, align: 'right' });

            doc.fillColor('#4b5563').font(safeFontRegular).text(`KDV (%${proposal.tax_rate}):`, 350, totalsY + 20);
            doc.fillColor('#111827').font(safeFontBold).text(`₺${proposal.tax_amount.toLocaleString('tr-TR')}`, 450, totalsY + 20, { width: 90, align: 'right' });

            doc.rect(340, totalsY + 40, 210, 40).fill('#fef2f2');
            doc.fillColor(primaryColor).fontSize(12).font(safeFontBold).text('GENEL TOPLAM:', 350, totalsY + 55);
            doc.fontSize(14).text(`₺${proposal.total.toLocaleString('tr-TR')}`, 450, totalsY + 55, { width: 90, align: 'right' });

            // Terms
            const termsY = totalsY + 110;
            doc.fillColor('#111827').fontSize(10).font(safeFontBold).text('Teklif Koşulları:', 50, termsY);
            doc.fillColor(secondaryColor).fontSize(9).font(safeFontRegular).text(proposal.terms || 'Teklifimize ilan reklam vergileri dahil, KDV hariçtir. Her türlü iptal talebi, en geç kampanya başlangıç tarihine 20 gün kala bildirilmelidir.', 50, termsY + 15, { width: 500, lineGap: 3 });

            // Signatures
            const sigY = 700;
            doc.moveTo(50, sigY).lineTo(250, sigY).stroke('#000');
            doc.moveTo(350, sigY).lineTo(550, sigY).stroke('#000');

            doc.fillColor('#111827').fontSize(10).font(safeFontBold);
            doc.text('İZMİR AÇIK HAVA (ONAY)', 50, sigY + 10, { width: 200, align: 'center' });
            doc.text('KİRACI (ONAY)', 350, sigY + 10, { width: 200, align: 'center' });

            doc.end();
        });
    }

    async sendProposalEmail(id: string, recipientEmail?: string, customMessage?: string): Promise<{ success: boolean; message: string }> {
        // Teklifi getir
        const proposal = await this.findOne(id);
        if (!proposal) {
            throw new Error('Teklif bulunamadı');
        }

        // PDF Hazırla
        const pdfBuffer = await this.generateProposalPDF(id);

        // Müşteri e-postasını belirle
        const toEmail = recipientEmail || (proposal as any).client?.email;
        if (!toEmail) {
            throw new Error('Müşteri e-posta adresi bulunamadı');
        }

        // Teklif detaylarını oluştur
        const items = (proposal as any).items || [];
        const itemsHtml = items.map((item: any) => {
            const m = item.metadata || {};
            const duration = m.duration ? `(${m.duration} ${m.period?.includes('GÜN') ? 'Gün' : 'Hafta'})` : '';
            const dates = m.start_date && m.end_date ? `<br/><small style="color: #666;">${m.start_date} - ${m.end_date}</small>` : '';

            return `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <div style="font-weight: bold; color: #1f2937;">${item.description || '-'}</div>
                        ${dates}
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 0}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${duration || '-'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₺${(item.unit_price || 0).toLocaleString('tr-TR')}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₺${(item.total || 0).toLocaleString('tr-TR')}</td>
                </tr>
            `;
        }).join('');

        const companyName = this.configService.get<string>('COMPANY_NAME') || 'İzmir Açıkhava Reklam Ajansı';
        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 700px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">${companyName}</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Teklif Bilgilendirmesi</p>
                </div>

                <!-- Content -->
                <div style="padding: 30px;">
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Sayın ${(proposal as any).client?.company_name || 'Değerli Müşterimiz'},</h2>
                    
                    ${customMessage ? `<p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">${customMessage}</p>` : ''}
                    
                    <p style="color: #4b5563; line-height: 1.6;">
                        Aşağıda, tarafınıza hazırladığımız teklif detaylarını bulabilirsiniz. Ayrıca teklif mektubunun resmi kopyası ekte tarafınıza sunulmuştur.
                    </p>

                    <!-- Proposal Info -->
                    <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 5px 0; color: #374151;"><strong>Teklif No:</strong> ${(proposal as any).proposal_number}</p>
                        <p style="margin: 5px 0; color: #374151;"><strong>Tarih:</strong> ${new Date((proposal as any).created_at).toLocaleDateString('tr-TR')}</p>
                        <p style="margin: 5px 0; color: #374151;"><strong>Geçerlilik:</strong> ${(proposal as any).valid_until ? new Date((proposal as any).valid_until).toLocaleDateString('tr-TR') : '30 gün'}</p>
                    </div>

                    <!-- Items Table -->
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background: #4f46e5; color: white;">
                                <th style="padding: 12px; text-align: left;">Açıklama</th>
                                <th style="padding: 12px; text-align: center;">Adet</th>
                                <th style="padding: 12px; text-align: center;">Dönem</th>
                                <th style="padding: 12px; text-align: right;">Birim Fiyat</th>
                                <th style="padding: 12px; text-align: right;">Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <div style="background: #f8fafc; border: 2px solid #4f46e5; border-radius: 12px; padding: 20px; margin-top: 20px; text-align: right;">
                        <p style="margin: 5px 0; color: #64748b; font-size: 14px;">Ara Toplam: <strong>₺${((proposal as any).subtotal || 0).toLocaleString('tr-TR')}</strong></p>
                        <p style="margin: 5px 0; color: #64748b; font-size: 14px;">KDV (%${(proposal as any).tax_rate || 20}): <strong>₺${((proposal as any).tax_amount || 0).toLocaleString('tr-TR')}</strong></p>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 24px; color: #4f46e5; font-weight: 800;">GENEL TOPLAM</p>
                            <p style="margin: 5px 0 0 0; font-size: 32px; color: #1e1b4b; font-weight: 900;">₺${((proposal as any).total || 0).toLocaleString('tr-TR')}</p>
                        </div>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                    <p style="color: #6b7280; font-size: 14px;">
                        Bu teklif hakkında sorularınız için bizimle iletişime geçebilirsiniz.<br>
                        <strong>Tel:</strong> 0232 431 0 75<br>
                        <strong>E-posta:</strong> ${this.configService.get('MAIL_USER')}
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #1f2937; padding: 20px; text-align: center;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} ${companyName} - Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        `;

        try {
            await this.mailService.sendMail(
                toEmail,
                `Teklif (₺${((proposal as any).total || 0).toLocaleString('tr-TR')}): ${(proposal as any).proposal_number} - ${(proposal as any).title || companyName}`,
                html,
                undefined,
                [
                    {
                        filename: `Teklif_${proposal.proposal_number}.pdf`,
                        content: pdfBuffer
                    }
                ]
            );

            // Durumu "SENT" olarak güncelle
            await this.updateStatus(id, 'SENT');

            return { success: true, message: `Teklif ${toEmail} adresine başarıyla gönderildi.` };
        } catch (error) {
            console.error('❌ E-posta gönderme hatası:', error);
            throw new Error(`E-posta gönderilemedi: ${error.message}`);
        }
    }
}
