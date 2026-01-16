import pandas as pd
import json

file_path = 'Karşıyaka Ürün Envanteri.xlsx'
xl = pd.ExcelFile(file_path)

all_data = []

type_mapping = {
    'BB': 'Billboard (BB)',
    'CLP  ': 'Raket (CLP)',
    'MGL  ': 'Megalight (MGL)',
    'GB  ': 'Giant Board (GB)',
    'LB  ': 'Led Board (LB)',
    'MB  ': 'Megalight Board (MB)',
    'KB  ': 'Kule Billboard (KB)'
}

for sheet_name in xl.sheet_names:
    df = xl.parse(sheet_name)
    # Clean column names
    df.columns = [c.strip() for c in df.columns]
    
    # Map sheet name to display type
    display_type = type_mapping.get(sheet_name, sheet_name.strip())
    
    for _, row in df.iterrows():
        if pd.isna(row.get('Kod')) or str(row.get('Kod')).strip() == '':
            continue
            
        item = {
            "code": str(row.get('Kod')).strip(),
            "type": display_type,
            "district": str(row.get('İlçe', 'Karşıyaka')).strip(),
            "neighborhood": str(row.get('Semt', '')).strip(),
            "address": str(row.get('Adres', '')).strip(),
            "coordinates": str(row.get('Koordinat', '')).strip(),
            "network": str(row.get('Network', '')).strip(),
            "is_active": True
        }
        all_data.append(item)

with open('full_inventory.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f"Total items extracted: {len(all_data)}")
