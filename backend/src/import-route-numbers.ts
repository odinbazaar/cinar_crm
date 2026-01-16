import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the Excel file to extract route numbers
const excelPath = path.join(__dirname, '..', '..', 'Karşıyaka Ürün Envanteri.xlsx');

console.log('Reading Excel file:', excelPath);

if (!fs.existsSync(excelPath)) {
    console.error('Excel file not found at:', excelPath);
    process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

// Extract header row and find column indices
const headers = data[0];
console.log('Headers:', headers);

// Find column indices
let kodIdx = -1;
let routNoIdx = -1;

for (let i = 0; i < headers.length; i++) {
    const h = String(headers[i] || '').toLowerCase().trim();
    if (h === 'kod' || h === 'code') kodIdx = i;
    if (h === 'rout no' || h === 'routno' || h === 'rout' || h === 'sıra no') routNoIdx = i;
}

console.log(`Found columns - Kod: ${kodIdx}, Rout No: ${routNoIdx}`);

if (kodIdx === -1 || routNoIdx === -1) {
    console.error('Could not find required columns!');
    console.log('Available columns:', headers);
    process.exit(1);
}

// Build mapping: code -> routeNo
const routeNoMap: Record<string, string> = {};
for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const kod = String(row[kodIdx] || '').trim();
    const routNo = String(row[routNoIdx] || '').trim();
    if (kod && routNo) {
        routeNoMap[kod] = routNo;
    }
}

console.log(`Found ${Object.keys(routeNoMap).length} route numbers`);
console.log('Sample mappings:', Object.entries(routeNoMap).slice(0, 10));

// Update inventory items in Supabase
async function updateInventory() {
    console.log('\nStep 1: Ensuring route_no column exists...');

    // First, try to add the column if it doesn't exist
    // We'll do this by running a raw SQL via the Supabase REST API
    const addColumnSql = `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_items' AND column_name = 'route_no'
            ) THEN
                ALTER TABLE inventory_items ADD COLUMN route_no TEXT;
            END IF;
        END $$;
    `;

    // Since we can't run raw SQL directly, let's just try the update
    // If the column doesn't exist, it will fail gracefully

    console.log('\nStep 2: Fetching inventory items...');

    // Get all inventory items
    const { data: items, error: fetchError } = await supabase
        .from('inventory_items')
        .select('id, code');

    if (fetchError) {
        console.error('Error fetching inventory:', fetchError.message);
        return;
    }

    console.log(`Found ${items?.length || 0} inventory items in database`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    console.log('\nStep 3: Updating route numbers...');

    for (const item of items || []) {
        const routeNo = routeNoMap[item.code];
        if (routeNo) {
            const { error: updateError } = await supabase
                .from('inventory_items')
                .update({ route_no: routeNo })
                .eq('id', item.id);

            if (updateError) {
                if (errorCount === 0) {
                    console.error(`First error updating ${item.code}:`, updateError.message);
                    console.log('\n⚠️ The route_no column may not exist in Supabase.');
                    console.log('Please run this SQL in Supabase SQL Editor:');
                    console.log('ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS route_no TEXT;');
                }
                errorCount++;
            } else {
                updatedCount++;
            }
        } else {
            notFoundCount++;
        }
    }

    console.log(`\n✅ Updated ${updatedCount} items with route numbers`);
    console.log(`⚠️ ${notFoundCount} items had no matching route number in Excel`);
    if (errorCount > 0) {
        console.log(`❌ ${errorCount} items failed to update`);
    }
}

updateInventory();
