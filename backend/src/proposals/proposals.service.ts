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
        const { data, error } = await supabase
            .from('proposals')
            .update(updateProposalDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Proposal;
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
        const time = String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `PROP - ${year}${month}${day} -${time} -${random} `;
    }
}
