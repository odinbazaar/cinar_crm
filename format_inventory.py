import json

def format_inventory():
    try:
        with open('inventory_raw.json', encoding='utf-8') as f:
            raw_data = json.load(f)
        
        formatted_list = []
        counter = 1
        for sheet_name, rows in raw_data.items():
            for row in rows:
                item = {
                    "id": str(counter),
                    "code": str(row.get("Kod", "")),
                    "type": sheet_name,
                    "district": row.get("İlçe", ""),
                    "neighborhood": row.get("Semt", ""),
                    "address": row.get("Adres", ""),
                    "coordinates": row.get("Koordinat", ""),
                    "network": "", # Will try to extract from code if needed
                    "is_active": True,
                    "created_at": "2026-01-01T00:00:00Z",
                    "updated_at": "2026-01-01T00:00:00Z"
                }
                
                # Simple network extraction from code like BB0101 -> maybe not reliable, but 
                # keep empty for now as in raw data it's not explicitly there for these sheets
                
                formatted_list.append(item)
                counter += 1
        
        with open('frontend/src/data/inventoryData.ts', 'w', encoding='utf-8') as f:
            f.write('export const inventoryData = ')
            json.dump(formatted_list, f, ensure_ascii=False, indent=2)
            f.write(';\n')
            
        print(f"Formatted {len(formatted_list)} inventory items.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    format_inventory()
