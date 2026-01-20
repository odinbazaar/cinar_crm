import { supabase } from '../lib/supabase';

export interface IncomingCall {
    id: string;
    call_date: string | null;
    company_name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    request_detail: string | null;
    notes: string | null;
    called_phone: string | null;
    status: 'pending' | 'contacted' | 'converted' | 'rejected';
    created_at: string;
    updated_at: string;
}

export const incomingCallsService = {
    async getAll(): Promise<IncomingCall[]> {
        const { data, error } = await supabase
            .from('incoming_calls')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching incoming calls:', error);
            return [];
        }
        return data || [];
    },

    async getById(id: string): Promise<IncomingCall | null> {
        const { data, error } = await supabase
            .from('incoming_calls')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching incoming call:', error);
            return null;
        }
        return data;
    },

    async create(call: Partial<IncomingCall>): Promise<IncomingCall | null> {
        const { data, error } = await supabase
            .from('incoming_calls')
            .insert([call])
            .select()
            .single();

        if (error) {
            console.error('Error creating incoming call:', error);
            return null;
        }
        return data;
    },

    async update(id: string, updates: Partial<IncomingCall>): Promise<IncomingCall | null> {
        const { data, error } = await supabase
            .from('incoming_calls')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating incoming call:', error);
            return null;
        }
        return data;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('incoming_calls')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting incoming call:', error);
            return false;
        }
        return true;
    },

    async updateStatus(id: string, status: IncomingCall['status']): Promise<boolean> {
        const { error } = await supabase
            .from('incoming_calls')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Error updating status:', error);
            return false;
        }
        return true;
    }
};
