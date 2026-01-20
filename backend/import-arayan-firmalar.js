const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Supabase connection
const supabaseUrl = 'https://laltmysfkyppkqykggmh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importArayanFirmalar() {
    try {
        // Read Excel file
        const filePath = path.join(__dirname, 'arayan.xlsx');
        console.log('Reading file:', filePath);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        console.log(`Found ${data.length} records in Excel`);

        // Map Excel columns to database fields
        const records = data.map((row, index) => {
            // Handle date - Excel stores dates as numbers
            let callDate = null;
            if (row['TARİH '] || row['TARİH']) {
                const dateVal = row['TARİH '] || row['TARİH'];
                if (typeof dateVal === 'number') {
                    // Excel date serial number to JS date
                    const excelEpoch = new Date(1899, 11, 30);
                    callDate = new Date(excelEpoch.getTime() + dateVal * 86400000);
                } else if (typeof dateVal === 'string') {
                    callDate = new Date(dateVal);
                }
            }

            return {
                call_date: callDate ? callDate.toISOString().split('T')[0] : null,
                company_name: (row['FİRMA '] || row['FİRMA'] || '').toString().trim(),
                contact_person: (row['İSİM '] || row['İSİM'] || '').toString().trim(),
                phone: (row['İLETİŞİM '] || row['İLETİŞİM'] || '').toString().trim(),
                email: (row['MAİL '] || row['MAİL'] || '').toString().trim(),
                request_detail: (row['TALEP '] || row['TALEP'] || '').toString().trim(),
                notes: (row['AÇIKLAMA '] || row['AÇIKLAMA'] || '').toString().trim(),
                called_phone: (row['ARANAN TEL '] || row['ARANAN TEL'] || '').toString().trim(),
                status: 'pending', // pending, contacted, converted, rejected
                created_at: new Date().toISOString()
            };
        }).filter(r => r.company_name); // Only keep records with company name

        console.log(`Mapped ${records.length} valid records`);
        console.log('Sample record:', records[0]);

        // First, create the table if it doesn't exist
        // This needs to be done in Supabase dashboard or via SQL
        // For now, we'll try to insert and see if it works

        // Insert records
        const { data: insertedData, error } = await supabase
            .from('incoming_calls')
            .upsert(records, { onConflict: 'company_name,phone' });

        if (error) {
            if (error.message.includes('relation "incoming_calls" does not exist')) {
                console.log('\n⚠️  Table "incoming_calls" does not exist. Please create it first with the SQL below:\n');
                console.log(`
CREATE TABLE public.incoming_calls (
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

-- Enable RLS
ALTER TABLE public.incoming_calls ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on incoming_calls" ON public.incoming_calls
    FOR ALL USING (true) WITH CHECK (true);

-- Add unique constraint to prevent duplicates
ALTER TABLE public.incoming_calls ADD CONSTRAINT incoming_calls_unique UNIQUE (company_name, phone);
                `);
                return;
            }
            console.error('Insert error:', error);
            return;
        }

        console.log(`✅ Successfully imported ${records.length} records to incoming_calls table`);

    } catch (err) {
        console.error('Error:', err);
    }
}

importArayanFirmalar();
