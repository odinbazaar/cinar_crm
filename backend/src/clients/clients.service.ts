import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import supabase from '../config/supabase.config';
import { Client, CreateClientDto, UpdateClientDto } from './clients.dto';

@Injectable()
export class ClientsService {
    async findAll(): Promise<Client[]> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching clients:', error);
            throw new Error(error.message);
        }
        return data as Client[];
    }

    async findOne(id: string): Promise<Client | null> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching client:', error);
            return null;
        }
        return data as Client;
    }

    async create(createClientDto: CreateClientDto): Promise<Client> {
        console.log('Creating client with data:', JSON.stringify(createClientDto, null, 2));

        // Sanitize database fields - remove fields that don't exist in Supabase yet
        const {
            request_detail,
            called_phone,
            lead_source,
            ...sanitizedData
        } = createClientDto as any;

        if (sanitizedData.account_manager_id === '') {
            sanitizedData.account_manager_id = undefined;
        }

        if (!sanitizedData.name) {
            sanitizedData.name = sanitizedData.company_name;
        }

        const { data, error } = await supabase
            .from('clients')
            .insert([sanitizedData])
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating client:', error);
            throw new HttpException(`Supabase Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Otomatik bildirim oluştur
        try {
            await supabase.from('notifications').insert([{
                type: 'client',
                title: 'Yeni Müşteri Eklendi',
                message: `${data.company_name || data.name} adlı yeni müşteri kaydedildi.`,
                related_id: data.id,
                related_type: 'clients'
            }]);
        } catch (notifError) {
            console.error('Error creating notification:', notifError);
        }

        console.log('Client created successfully:', data);
        return data as Client;
    }

    async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
        // Sanitize database fields
        const {
            request_detail,
            called_phone,
            lead_source,
            ...sanitizedData
        } = updateClientDto as any;

        if (sanitizedData.account_manager_id === '') {
            sanitizedData.account_manager_id = undefined;
        }

        const { data, error } = await supabase
            .from('clients')
            .update(sanitizedData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error updating client:', error);
            throw new Error(error.message);
        }
        return data as Client;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('clients').delete().eq('id', id);

        if (error) throw new Error(error.message);
    }

    async checkReminders(): Promise<any> {
        console.log('Checking all tables for note reminders...');
        const now = new Date();
        const results: any[] = [];

        const tables = [
            { name: 'clients', labelField: 'company_name' },
            { name: 'customer_requests', labelField: 'request_number' },
            { name: 'incoming_calls', labelField: 'company_name' }
        ];

        for (const table of tables) {
            const { data, error } = await supabase
                .from(table.name)
                .select(`id, ${table.labelField}, notes`)
                .not('notes', 'is', null) as { data: any[], error: any };

            if (error) {
                console.error(`Error fetching ${table.name} for reminders:`, error);
                continue;
            }

            for (const item of data) {
                if (!item.notes || !item.notes.startsWith('[')) continue;

                let notesArr;
                try {
                    notesArr = JSON.parse(item.notes);
                } catch (e) { continue; }

                let changed = false;
                for (const note of notesArr) {
                    if (note.reminderDate && !note.isReminded) {
                        const reminderDateTime = new Date(`${note.reminderDate}T${note.reminderTime || '09:00'}`);
                        if (reminderDateTime <= now) {
                            try {
                                const label = item[table.labelField] || 'İsimsiz Kayıt';
                                await supabase.from('notifications').insert([{
                                    type: 'note',
                                    title: `Hatırlatıcı: ${label}`,
                                    message: note.content,
                                    related_id: item.id,
                                    related_type: table.name
                                }]);

                                note.isReminded = true;

                                if (note.repeat) {
                                    const nextDate = new Date(reminderDateTime);
                                    nextDate.setDate(nextDate.getDate() + 1);
                                    note.reminderDate = nextDate.toISOString().split('T')[0];
                                    note.isReminded = false;
                                }

                                changed = true;
                                results.push({ table: table.name, label, note: note.content });
                            } catch (notifErr) {
                                console.error('Failed to create reminder notification:', notifErr);
                            }
                        }
                    }
                }

                if (changed) {
                    await supabase.from(table.name).update({ notes: JSON.stringify(notesArr) }).eq('id', item.id);
                }
            }
        }

        return { status: 'ok', sent: results.length, details: results };
    }

    async getByLeadStage(stage: string): Promise<Client[]> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('lead_stage', stage)
            .eq('is_active', true);

        if (error) throw new Error(error.message);
        return data as Client[];
    }

    async getActiveClients(): Promise<Client[]> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw new Error(error.message);
        return data as Client[];
    }
}
