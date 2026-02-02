import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL || 'https://laltmysfkyppkqykggmh.supabase.co';
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-key') as string;

const supabase = createClient(url, key);

async function testCreateClient() {
    console.log('Testing client creation with empty strings...');
    const clientData = {
        company_name: 'TEST EMPTY FIELDS',
        name: 'TEST EMPTY FIELDS',
        type: 'corporate',
        status: 'potential',
        lead_stage: 'Aday',
        trade_name: '',
        sector: '',
        tax_office: '',
        tax_number: '',
        address: '',
        city: '',
        district: '',
        postal_code: '',
        contact_person: '',
        email: '',
        phone: '',
        notes: '',
        request_detail: '',
        called_phone: '',
        lead_source: '',
        account_manager_id: null
    };

    const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

    if (error) {
        console.error('❌ Error Message:', error.message);
        console.error('❌ Error Code:', error.code);
    } else {
        console.log('✅ Client created successfully:', data.id);
        // cleanup
        await supabase.from('clients').delete().eq('id', data.id);
    }
}

testCreateClient();
