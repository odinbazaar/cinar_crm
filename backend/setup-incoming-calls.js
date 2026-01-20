const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS public.incoming_calls (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            call_date DATE,
            company_name TEXT NOT NULL,
            contact_person TEXT,
            phone TEXT,
            email TEXT,
            request_detail TEXT,
            notes TEXT,
            called_phone TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.log('RPC not available, trying direct approach...');
        // Alternative: Just try to insert data directly, table might already exist
        return false;
    }

    console.log('Table created successfully');
    return true;
}

async function importData() {
    const xlsx = require('xlsx');
    const path = require('path');

    const filePath = path.join(__dirname, 'arayan.xlsx');
    console.log('Reading:', filePath);

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`Processing ${data.length} rows...`);

    const records = [];
    for (const row of data) {
        let callDate = null;
        const dateVal = row['TARİH '] || row['TARİH'];
        if (dateVal) {
            if (typeof dateVal === 'number') {
                const excelEpoch = new Date(1899, 11, 30);
                callDate = new Date(excelEpoch.getTime() + dateVal * 86400000);
            }
        }

        const companyName = (row['FİRMA '] || row['FİRMA'] || '').toString().trim();
        if (!companyName) continue;

        records.push({
            call_date: callDate ? callDate.toISOString().split('T')[0] : null,
            company_name: companyName,
            contact_person: (row['İSİM '] || row['İSİM'] || '').toString().trim(),
            phone: (row['İLETİŞİM '] || row['İLETİŞİM'] || '').toString().trim(),
            email: (row['MAİL '] || row['MAİL'] || '').toString().trim(),
            request_detail: (row['TALEP '] || row['TALEP'] || '').toString().trim(),
            notes: (row['AÇIKLAMA '] || row['AÇIKLAMA'] || '').toString().trim(),
            called_phone: (row['ARANAN TEL '] || row['ARANAN TEL'] || '').toString().trim(),
            status: 'pending'
        });
    }

    console.log(`Inserting ${records.length} records...`);

    // Insert one by one to avoid conflicts
    let success = 0;
    for (const record of records) {
        const { error } = await supabase
            .from('incoming_calls')
            .insert([record]);

        if (!error) {
            success++;
        } else if (!error.message.includes('duplicate')) {
            console.log('Error:', error.message, 'for', record.company_name);
        }
    }

    console.log(`✅ Imported ${success}/${records.length} records`);
}

async function main() {
    await createTable();
    await importData();
}

main().catch(console.error);
