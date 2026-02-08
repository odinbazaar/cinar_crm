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
            const validUserId = (createProposalDto.created_by_id && createProposalDto.created_by_id !== '')
                ? createProposalDto.created_by_id
                : '95959c2d-c5e1-454c-834f-3746d0a401c5';

            // Sanitize IDs
            const clientId = createProposalDto.client_id === '' ? null : createProposalDto.client_id;
            const projectId = createProposalDto.project_id === '' ? null : createProposalDto.project_id;

            // Create proposal
            const { data: proposal, error: proposalError } = await supabase
                .from('proposals')
                .insert([
                    {
                        proposal_number: proposalNumber,
                        title: createProposalDto.title,
                        client_id: clientId,
                        project_id: projectId,
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
                    // metadata: item.metadata || {}, // Omit if column missing
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
                    // metadata: item.metadata || {}, // Omit if column missing
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
        const upperStatus = status.toUpperCase();
        const updateData: any = { status: upperStatus };

        if (upperStatus === 'SENT' && !updateData.sent_at) {
            updateData.sent_at = new Date();
        } else if (upperStatus === 'ACCEPTED' || upperStatus === 'APPROVED') {
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
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const buffers: Buffer[] = [];

            // Font Yolları
            const fontsDir = path.join(process.cwd(), 'src', 'assets', 'fonts');
            const distFontsDir = path.join(process.cwd(), 'dist', 'assets', 'fonts');

            let regularFontPath = path.join(fontsDir, 'Roboto-Regular.ttf');
            let boldFontPath = path.join(fontsDir, 'Roboto-Bold.ttf');

            // Find valid font paths
            if (!fs.existsSync(regularFontPath)) {
                regularFontPath = path.join(distFontsDir, 'Roboto-Regular.ttf');
                boldFontPath = path.join(distFontsDir, 'Roboto-Bold.ttf');
            }

            let safeFontRegular = 'Helvetica';
            let safeFontBold = 'Helvetica-Bold';

            // Fontları kaydet
            try {
                if (fs.existsSync(regularFontPath) && fs.existsSync(boldFontPath)) {
                    doc.registerFont('CustomRegular', regularFontPath);
                    doc.registerFont('CustomBold', boldFontPath);
                    safeFontRegular = 'CustomRegular';
                    safeFontBold = 'CustomBold';
                }
            } catch (fontError) {
                console.error('Font registration error:', fontError.message);
            }

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const primaryColor = '#dc2626'; // Red-600
            const secondaryColor = '#4b5563'; // Gray-600

            // Header - Logo (Sözleşme stiliyle uyumlu)
            doc.rect(40, 35, 50, 50).fill(primaryColor);
            doc.fillColor('white').fontSize(20).font(safeFontBold).text('İAR', 40, 50, { width: 50, align: 'center' });

            // Brand - Tek satırda
            doc.fillColor(primaryColor).fontSize(14).font(safeFontBold).text('İZMİR AÇIK HAVA REKLAM', 100, 48);

            // Company Info (sağ taraf)
            const companyName = this.configService.get<string>('COMPANY_NAME') || 'İzmir Açıkhava Reklam Ajansı';
            doc.fillColor(secondaryColor).fontSize(7).font(safeFontRegular);
            doc.text(companyName, 350, 35, { align: 'right', width: 200 });
            doc.text('MANAS BULVARI ADALET MAH. NO:47 KAT:28', 350, 45, { align: 'right', width: 200 });
            doc.text('FOLKART TOWERS BAYRAKLI İZMİR', 350, 55, { align: 'right', width: 200 });
            doc.text('TEL: 0232 431 0 75 | FAKS: 0232 431 00 73', 350, 65, { align: 'right', width: 200 });
            doc.text('KARŞIYAKA V.D. - 6490546546', 350, 75, { align: 'right', width: 200 });

            doc.moveTo(40, 95).lineTo(555, 95).stroke('#e5e7eb');

            // Proposal Header
            doc.fillColor('#111827').fontSize(12).font(safeFontBold).text('BÜTÇE TEKLİF MEKTUBU', 40, 105, { align: 'center', width: 515 });

            // Info Grid
            const infoY = 130;
            doc.fontSize(9).font(safeFontBold).text('TEKLİF NO:', 40, infoY);
            doc.font(safeFontRegular).text(proposal.proposal_number, 120, infoY);

            doc.font(safeFontBold).text('MÜŞTERİ:', 40, infoY + 15);
            doc.font(safeFontRegular).text((proposal as any).client?.company_name || '—', 120, infoY + 15);

            doc.font(safeFontBold).text('TARİH:', 350, infoY);
            doc.font(safeFontRegular).text(new Date(proposal.created_at).toLocaleDateString('tr-TR'), 420, infoY);

            doc.font(safeFontBold).text('GEÇERLİLİK:', 350, infoY + 15);
            doc.font(safeFontRegular).text(proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : '30 Gün', 420, infoY + 15);

            // Table Header - Genişletilmiş kolonlar (DÖNEM dahil)
            const tableTop = 175;
            const colWidths = { product: 110, qty: 30, period: 45, unitPrice: 55, discPrice: 55, opCost: 50, printCost: 50, total: 60 };
            const colX = {
                product: 40,
                qty: 150,
                period: 180,
                unitPrice: 225,
                discPrice: 280,
                opCost: 335,
                printCost: 385,
                total: 435
            };

            doc.rect(40, tableTop, 515, 22).fill(primaryColor);
            doc.fillColor('white').fontSize(6.5).font(safeFontBold);
            doc.text('ÜRÜN / LOKASYON', colX.product + 3, tableTop + 7, { width: colWidths.product });
            doc.text('ADET', colX.qty, tableTop + 7, { width: colWidths.qty, align: 'center' });
            doc.text('DÖNEM', colX.period, tableTop + 7, { width: colWidths.period, align: 'center' });
            doc.text('BİRİM FİYAT', colX.unitPrice, tableTop + 7, { width: colWidths.unitPrice, align: 'center' });
            doc.text('İND. FİYAT', colX.discPrice, tableTop + 7, { width: colWidths.discPrice, align: 'center' });
            doc.text('OP.', colX.opCost, tableTop + 7, { width: colWidths.opCost, align: 'center' });
            doc.text('BASKI', colX.printCost, tableTop + 7, { width: colWidths.printCost, align: 'center' });
            doc.text('TOPLAM', colX.total + 5, tableTop + 7, { width: colWidths.total - 5, align: 'right' });

            // Table Rows
            let rowY = tableTop + 22;
            const items = (proposal as any).items || [];
            doc.fillColor('#374151').font(safeFontRegular).fontSize(7);

            // OP ve BASKI satırlarını ayıkla
            let opTotal = 0;
            let baskiTotal = 0;
            const mainItems = items.filter((item: any) => {
                if (item.description.includes('OP.') || item.description.toLowerCase().includes('operasyon')) {
                    opTotal += Number(item.total) || 0;
                    return false;
                }
                if (item.description.includes('BASKI') || item.description.toLowerCase().includes('baskı')) {
                    baskiTotal += Number(item.total) || 0;
                    return false;
                }
                return true;
            });

            // Her ana ürün için OP ve Baskı bedelini hesapla
            const opPerItem = mainItems.length > 0 ? opTotal / mainItems.length : 0;
            const baskiPerItem = mainItems.length > 0 ? baskiTotal / mainItems.length : 0;

            mainItems.forEach((item: any) => {
                // Açıklamayı temizle - parantez içindeki süre ibarelerini kaldır
                let cleanDescription = item.description || '';
                // [DÖNEM: ...] temizle
                cleanDescription = cleanDescription.replace(/\[DÖNEM:.*?\]/g, '').trim();
                // [BAŞLANGIÇ: ...] temizle
                cleanDescription = cleanDescription.replace(/\[BAŞLANGIÇ:.*?\]/g, '').trim();
                // (1 Hafta), (2 Hafta) gibi parantez içindekilerini temizle
                cleanDescription = cleanDescription.replace(/\(\d+\s*(Hafta|hafta|GÜN|gün|Gün)\)/g, '').trim();
                // Fazla boşlukları temizle
                cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();

                // Dönem bilgisini çıkar
                const metadata = item.metadata || {};
                let period = metadata.period || metadata.duration || '1';
                // [DÖNEM: ...] varsa al
                const periodMatch = (item.description || '').match(/\[DÖNEM:\s*(.*?)\]/);
                if (periodMatch) period = periodMatch[1];

                const unitPrice = Number(item.unit_price) || 0;
                const discountedPrice = unitPrice;
                const itemOpCost = Math.round(opPerItem);
                const itemBaskiCost = Math.round(baskiPerItem);
                const itemTotal = Number(item.total) || 0;

                doc.text(cleanDescription, colX.product + 3, rowY + 8, { width: colWidths.product - 3 });
                doc.text(item.quantity.toString(), colX.qty, rowY + 8, { width: colWidths.qty, align: 'center' });
                doc.text(period, colX.period, rowY + 8, { width: colWidths.period, align: 'center' });
                doc.text(`₺${unitPrice.toLocaleString('tr-TR')}`, colX.unitPrice, rowY + 8, { width: colWidths.unitPrice, align: 'center' });
                doc.text(`₺${discountedPrice.toLocaleString('tr-TR')}`, colX.discPrice, rowY + 8, { width: colWidths.discPrice, align: 'center' });
                doc.text(`₺${itemOpCost.toLocaleString('tr-TR')}`, colX.opCost, rowY + 8, { width: colWidths.opCost, align: 'center' });
                doc.text(`₺${itemBaskiCost.toLocaleString('tr-TR')}`, colX.printCost, rowY + 8, { width: colWidths.printCost, align: 'center' });
                doc.font(safeFontBold).text(`₺${itemTotal.toLocaleString('tr-TR')}`, colX.total + 5, rowY + 8, { width: colWidths.total - 5, align: 'right' });
                doc.font(safeFontRegular);

                rowY += 25;
                doc.moveTo(40, rowY).lineTo(555, rowY).stroke('#f3f4f6');

                // Check for page break
                if (rowY > 700) {
                    doc.addPage();
                    rowY = 50;
                }
            });

            // Totals
            const totalsY = rowY + 15;
            doc.fillColor('#4b5563').fontSize(9);
            doc.text('Ara Toplam:', 380, totalsY);
            doc.fillColor('#111827').font(safeFontBold).text(`₺${proposal.subtotal.toLocaleString('tr-TR')}`, 470, totalsY, { width: 85, align: 'right' });

            doc.fillColor('#4b5563').font(safeFontRegular).text(`KDV (%${proposal.tax_rate}):`, 380, totalsY + 18);
            doc.fillColor('#111827').font(safeFontBold).text(`₺${proposal.tax_amount.toLocaleString('tr-TR')}`, 470, totalsY + 18, { width: 85, align: 'right' });

            doc.rect(370, totalsY + 38, 185, 35).fill('#fef2f2');
            doc.fillColor(primaryColor).fontSize(10).font(safeFontBold).text('GENEL TOPLAM:', 380, totalsY + 50);
            doc.fontSize(12).text(`₺${proposal.total.toLocaleString('tr-TR')}`, 470, totalsY + 50, { width: 85, align: 'right' });

            // Terms
            const termsY = totalsY + 90;
            doc.fillColor('#111827').fontSize(9).font(safeFontBold).text('Teklif Koşulları:', 40, termsY);
            doc.fillColor(secondaryColor).fontSize(8).font(safeFontRegular).text(proposal.terms || 'Teklifimize ilan reklam vergileri dahil, KDV hariçtir. Her türlü iptal talebi, en geç kampanya başlangıç tarihine 20 gün kala bildirilmelidir.', 40, termsY + 12, { width: 515, lineGap: 2 });

            // Signatures
            const sigY = 720;
            doc.moveTo(40, sigY).lineTo(220, sigY).stroke('#000');
            doc.moveTo(380, sigY).lineTo(555, sigY).stroke('#000');

            doc.fillColor('#111827').fontSize(9).font(safeFontBold);
            doc.text('İZMİR AÇIK HAVA (ONAY)', 40, sigY + 8, { width: 180, align: 'center' });
            doc.text('KİRACI (ONAY)', 380, sigY + 8, { width: 175, align: 'center' });

            doc.end();
        });

    }

    async sendProposalEmail(id: string, recipientEmail?: string, customMessage?: string, senderEmail?: string): Promise<{ success: boolean; message: string }> {
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
        
        // OP ve BASKI satırlarını ayıkla
        let opTotal = 0;
        let baskiTotal = 0;
        const mainItems = items.filter((item: any) => {
            if (item.description.includes('OP.') || item.description.toLowerCase().includes('operasyon')) {
                opTotal += Number(item.total) || 0;
                return false;
            }
            if (item.description.includes('BASKI') || item.description.toLowerCase().includes('baskı')) {
                baskiTotal += Number(item.total) || 0;
                return false;
            }
            return true;
        });

        const opPerItem = mainItems.length > 0 ? Math.round(opTotal / mainItems.length) : 0;
        const baskiPerItem = mainItems.length > 0 ? Math.round(baskiTotal / mainItems.length) : 0;

        const itemsHtml = mainItems.map((item: any) => {
            // Açıklamayı temizle
            let cleanDescription = item.description || '';
            cleanDescription = cleanDescription.replace(/\[DÖNEM:.*?\]/g, '').trim();
            cleanDescription = cleanDescription.replace(/\[BAŞLANGIÇ:.*?\]/g, '').trim();
            cleanDescription = cleanDescription.replace(/\(\d+\s*(Hafta|hafta|GÜN|gün|Gün)\)/g, '').trim();
            cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();

            // Dönem bilgisini çıkar
            const metadata = (item as any).metadata || {};
            let period = metadata.period || metadata.duration || '1';
            const periodMatch = (item.description || '').match(/\[DÖNEM:\s*(.*?)\]/);
            if (periodMatch) period = periodMatch[1];

            const unitPrice = Number(item.unit_price) || 0;
            const discountedPrice = unitPrice;
            const itemTotal = Number(item.total) || 0;

            return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #1f2937;">${cleanDescription || '-'}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 0}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${period}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">₺${unitPrice.toLocaleString('tr-TR')}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">₺${discountedPrice.toLocaleString('tr-TR')}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">₺${opPerItem.toLocaleString('tr-TR')}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">₺${baskiPerItem.toLocaleString('tr-TR')}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₺${itemTotal.toLocaleString('tr-TR')}</td>
                </tr>
            `;
        }).join('');

        const companyName = this.configService.get<string>('COMPANY_NAME') || 'İzmir Açıkhava Reklam Ajansı';
        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 750px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <head>
                    <meta charset="UTF-8">
                </head>
                <!-- Header - Kırmızı tema -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 25px; text-align: left;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="vertical-align: middle;">
                                <div style="display: inline-block; background: white; padding: 8px 12px; border-radius: 6px; margin-right: 12px;">
                                    <span style="color: #dc2626; font-weight: 900; font-size: 20px;">İAR</span>
                                </div>
                                <span style="color: white; font-size: 16px; font-weight: bold;">İZMİR AÇIK HAVA REKLAM</span>
                            </td>
                            <td style="text-align: right; color: rgba(255,255,255,0.9); font-size: 11px;">
                                Teklif Bilgilendirmesi
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Content -->
                <div style="padding: 30px;">
                    <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 18px;">Sayın ${(proposal as any).client?.company_name || 'Değerli Müşterimiz'},</h2>
                    
                    ${customMessage ? `<p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">${customMessage}</p>` : ''}
                    
                    <p style="color: #4b5563; line-height: 1.6;">
                        Aşağıda, tarafınıza hazırladığımız teklif detaylarını bulabilirsiniz. Teklif mektubunun resmi kopyası ekte sunulmuştur.
                    </p>

                    <!-- Proposal Info -->
                    <div style="background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 5px 0; color: #374151; font-size: 13px;"><strong>Teklif No:</strong> ${(proposal as any).proposal_number}</p>
                        <p style="margin: 5px 0; color: #374151; font-size: 13px;"><strong>Tarih:</strong> ${new Date((proposal as any).created_at).toLocaleDateString('tr-TR')}</p>
                        <p style="margin: 5px 0; color: #374151; font-size: 13px;"><strong>Geçerlilik:</strong> ${(proposal as any).valid_until ? new Date((proposal as any).valid_until).toLocaleDateString('tr-TR') : '30 gün'}</p>
                    </div>

                    <!-- Items Table - Genişletilmiş kolonlar (DÖNEM dahil) -->
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px;">
                        <thead>
                            <tr style="background: #dc2626; color: white;">
                                <th style="padding: 8px; text-align: left;">Ürün</th>
                                <th style="padding: 8px; text-align: center;">Adet</th>
                                <th style="padding: 8px; text-align: center;">Dönem</th>
                                <th style="padding: 8px; text-align: center;">Birim</th>
                                <th style="padding: 8px; text-align: center;">İnd.</th>
                                <th style="padding: 8px; text-align: center;">Op.</th>
                                <th style="padding: 8px; text-align: center;">Baskı</th>
                                <th style="padding: 8px; text-align: right;">Toplam</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 20px; margin-top: 20px; text-align: right;">
                        <p style="margin: 5px 0; color: #64748b; font-size: 13px;">Ara Toplam: <strong>₺${((proposal as any).subtotal || 0).toLocaleString('tr-TR')}</strong></p>
                        <p style="margin: 5px 0; color: #64748b; font-size: 13px;">KDV (%${(proposal as any).tax_rate || 20}): <strong>₺${((proposal as any).tax_amount || 0).toLocaleString('tr-TR')}</strong></p>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fecaca;">
                            <p style="margin: 0; font-size: 20px; color: #dc2626; font-weight: 800;">GENEL TOPLAM</p>
                            <p style="margin: 5px 0 0 0; font-size: 28px; color: #1e1b4b; font-weight: 900;">₺${((proposal as any).total || 0).toLocaleString('tr-TR')}</p>
                        </div>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                    <p style="color: #6b7280; font-size: 13px;">
                        Bu teklif hakkında sorularınız için bizimle iletişime geçebilirsiniz.<br>
                        <strong>Tel:</strong> 0232 431 0 75<br>
                        <strong>E-posta:</strong> ${senderEmail || this.configService.get('MAIL_USER')}
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #1f2937; padding: 20px; text-align: center;">
                    <p style="color: #9ca3af; margin: 0; font-size: 11px;">
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
                ],
                senderEmail // Seçilen gönderici e-posta adresi
            );

            // Durumu "SENT" olarak güncelle
            await this.updateStatus(id, 'SENT');

            const fromInfo = senderEmail || 'varsayılan hesap';
            return { success: true, message: `Teklif ${toEmail} adresine ${fromInfo} üzerinden başarıyla gönderildi.` };
        } catch (error) {
            console.error('❌ E-posta gönderme hatası:', error);
            throw new Error(`E-posta gönderilemedi: ${error.message}`);
        }
    }
}
