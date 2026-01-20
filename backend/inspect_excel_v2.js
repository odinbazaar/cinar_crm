const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = 'd:\\acursor\\jul4\\ARAYAN FİRMALAR .xlsx';

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Headers:', data[0]);
console.log('Sample Data (Row 1):', data[1]);
console.log('Sample Data (Row 2):', data[2]);
