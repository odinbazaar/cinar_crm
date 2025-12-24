import { Injectable } from '@nestjs/common';
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

        const { data, error } = await supabase
            .from('clients')
            .insert([createClientDto])
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating client:', error);
            console.error('Error code:', error.code);
            console.error('Error details:', error.details);
            console.error('Error hint:', error.hint);
            throw new Error(error.message);
        }

        console.log('Client created successfully:', data);
        return data as Client;
    }

    async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
        const { data, error } = await supabase
            .from('clients')
            .update(updateClientDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Client;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('clients').delete().eq('id', id);

        if (error) throw new Error(error.message);
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
