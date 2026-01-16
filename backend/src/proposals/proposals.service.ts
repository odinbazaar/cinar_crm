import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import supabase from '../config/supabase.config';
import { Proposal, CreateProposalDto, UpdateProposalDto } from './proposals.dto';

@Injectable()
export class ProposalsService {
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
            const subtotal = (createProposalDto.items || []).reduce(
                (sum, item) => {
                    const itemQty = Number(item.quantity) || 0;
                    const itemPrice = Number(item.unit_price) || 0;
                    const itemTotal = itemQty * itemPrice;
                    console.log(`Item Calc: Qty(${itemQty}) * Price(${itemPrice}) = ${itemTotal} `);
                    return sum + itemTotal;
                },
                0,
            );

            console.log('Calculated Subtotal:', subtotal);

            if (isNaN(subtotal)) {
                console.error('Subtotal calculated as NaN!');
                throw new Error('Invalid calculation: subtotal is NaN');
            }

            const taxRate = 20; // Default 20% tax
            const taxAmount = (subtotal * taxRate) / 100;
            const total = subtotal + taxAmount;

            console.log(`Totals: Sub(${subtotal}), Tax(${taxAmount}), Total(${total})`);

            // Create proposal
            const { data: proposal, error: proposalError } = await supabase
                .from('proposals')
                .insert([
                    {
                        proposal_number: proposalNumber,
                        title: createProposalDto.title,
                        client_id: createProposalDto.client_id,
                        project_id: createProposalDto.project_id,
                        created_by_id: createProposalDto.created_by_id,
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
                    metadata: item.metadata || {},
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
                    metadata: item.metadata || {},
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
    async sendProposalEmail(id: string, recipientEmail?: string, customMessage?: string): Promise<{ success: boolean; message: string }> {
        const nodemailer = await import('nodemailer');

        // Teklifi getir
        const proposal = await this.findOne(id);
        if (!proposal) {
            throw new Error('Teklif bulunamadı');
        }

        // Müşteri e-postasını belirle
        const toEmail = recipientEmail || (proposal as any).client?.email;
        if (!toEmail) {
            throw new Error('Müşteri e-posta adresi bulunamadı');
        }

        // Rezervasyon@izmiracikhavareklam.com hesabından gönder (şifresi çalışıyor)
        const transporter = nodemailer.createTransport({
            host: 'smtp.yandex.com.tr',
            port: 465,
            secure: true,
            auth: {
                user: 'Rezervasyon@izmiracikhavareklam.com',
                pass: process.env.MAIL_PASS || 'Reziar.075',
            },
        });

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

        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 700px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">${process.env.COMPANY_NAME || 'Çınar Reklam Ajansı'}</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Teklif Bilgilendirmesi</p>
                </div>

                <!-- Content -->
                <div style="padding: 30px;">
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Sayın ${(proposal as any).client?.company_name || 'Değerli Müşterimiz'},</h2>
                    
                    ${customMessage ? `<p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">${customMessage}</p>` : ''}
                    
                    <p style="color: #4b5563; line-height: 1.6;">
                        Aşağıda, tarafınıza hazırladığımız teklif detaylarını bulabilirsiniz.
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
                    <div style="text-align: right; margin-top: 20px;">
                        <p style="margin: 5px 0; color: #374151;">Ara Toplam: <strong>₺${((proposal as any).subtotal || 0).toLocaleString('tr-TR')}</strong></p>
                        <p style="margin: 5px 0; color: #374151;">KDV (%${(proposal as any).tax_rate || 20}): <strong>₺${((proposal as any).tax_amount || 0).toLocaleString('tr-TR')}</strong></p>
                        <p style="margin: 10px 0; font-size: 18px; color: #4f46e5;"><strong>Genel Toplam: ₺${((proposal as any).total || 0).toLocaleString('tr-TR')}</strong></p>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                    <p style="color: #6b7280; font-size: 14px;">
                        Bu teklif hakkında sorularınız için bizimle iletişime geçebilirsiniz.<br>
                        <strong>Tel:</strong> 0232 XXX XX XX<br>
                        <strong>E-posta:</strong> Rezervasyon@izmiracikhavareklam.com
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #1f2937; padding: 20px; text-align: center;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Çınar Reklam Ajansı'} - Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        `;

        try {
            await transporter.sendMail({
                from: `"${process.env.COMPANY_NAME || 'Çınar Reklam'}" <Rezervasyon@izmiracikhavareklam.com>`,
                to: toEmail,
                cc: 'Rezervasyon@izmiracikhavareklam.com',
                subject: `Teklif: ${(proposal as any).proposal_number} - ${(proposal as any).title || 'Çınar Reklam'}`,
                html: html,
            });

            // Durumu "SENT" olarak güncelle
            await this.updateStatus(id, 'SENT');

            console.log(`✅ Teklif e-postası gönderildi: ${toEmail}`);
            return { success: true, message: `Teklif ${toEmail} adresine başarıyla gönderildi.` };
        } catch (error) {
            console.error('❌ E-posta gönderme hatası:', error);
            throw new Error(`E-posta gönderilemedi: ${error.message}`);
        }
    }
}
