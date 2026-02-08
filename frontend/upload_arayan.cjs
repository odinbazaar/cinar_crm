const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadData() {
    try {
        const jsonPath = path.join(__dirname, '..', 'arayan_firmalar.json');
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(rawData);

        console.log(`Read ${data.length} records from JSON.`);

        // 1. Delete all existing records
        console.log('Cleaning existing records...');
        const { error: deleteError } = await supabase
            .from('incoming_calls')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError) {
            console.error('Error cleaning table:', deleteError);
            return;
        }

        // 2. Mapping records
        const mappedData = data.map(record => {
            const dateStr = record['TARİH '] || null;
            let callDate = null;
            if (dateStr) {
                callDate = dateStr.split('T')[0];
            }

            return {
                call_date: callDate,
                company_name: (record['FİRMA '] || 'İSİMSİZ FİRMA').trim(),
                contact_person: (record['İSİM '] || '').trim(),
                phone: (record['İLETİŞİM '] || '').toString().trim(),
                email: (record['MAİL '] || '').trim(),
                request_detail: (record['TALEP '] || '').trim(),
                notes: (record['AÇIKLAMA '] || '').trim(),
                called_phone: (record['ARANAN TEL '] || '').trim(),
                status: 'pending'
            };
        });

        // 3. Insert in chunks
        const chunkSize = 50;
        for (let i = 0; i < mappedData.length; i += chunkSize) {
            const chunk = mappedData.slice(i, i + chunkSize);
            const { error } = await supabase
                .from('incoming_calls')
                .insert(chunk);
            
            if (error) {
                console.error(`Error inserting chunk ${i / chunkSize}:`, error);
            } else {
                console.log(`Inserted chunk ${i / chunkSize + 1} / ${Math.ceil(mappedData.length / chunkSize)}`);
            }
        }

        console.log('Upload complete!');

    } catch (err) {
        console.error('Fatal error:', err);
    }
}

uploadData();
