import pandas as pd
import requests
import os
import sys
from dotenv import load_dotenv

# Redirect output to file and terminal
class Logger(object):
    def __init__(self):
        self.terminal = sys.stdout
        self.log = open("update_log.txt", "w", encoding='utf-8')

    def write(self, message):
        self.terminal.write(message)
        self.log.write(message)

    def flush(self):
        pass

sys.stdout = Logger()

# Load environment variables
load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: Supabase credentials not found in backend/.env")
    exit(1)

HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

def update_from_excel(filename):
    print(f"\n--- Processing {filename} ---")
    if not os.path.exists(filename):
        print(f"File {filename} not found.")
        return
        
    try:
        xl = pd.ExcelFile(filename)
        for sheet in xl.sheet_names:
            print(f"Reading sheet: {sheet}")
            type_map = {
                'Billboard': 'BB',
                'CLP': 'CLP',
                'Megalight': 'MGL',
                'Giantboard': 'GB',
                'Megaboard': 'MB',
                'Kuleboard': 'KB',
                'BB': 'BB',
                'CLP  ': 'CLP',
                'MGL  ': 'MGL',
                'LB ': 'LB',
                'GB  ': 'GB',
                'MB  ': 'MB',
                'KB  ': 'KB'
            }
            item_type = type_map.get(sheet.strip(), sheet.strip())
            
            # Use header=1 for 'Ürün Envanteri Güncel.xlsx'
            # For others, it might be header=0 or something else.
            # Let's try to detect if header=1 or header=0 is better.
            
            df = pd.read_excel(xl, sheet_name=sheet)
            if 'Kod' not in df.columns:
                # Try header=1
                df = pd.read_excel(xl, sheet_name=sheet, header=1)
                
            # Clean up columns
            df.columns = [str(c).strip() for c in df.columns]
            
            if 'Kod' not in df.columns:
                print(f"Skipping sheet {sheet}: 'Kod' column not found.")
                continue
                
            df = df.dropna(subset=['Kod'])
            
            items = []
            for _, row in df.iterrows():
                code = str(row.get('Kod', '')).strip()
                if not code or code.lower() == 'nan' or code == 'Kod':
                    continue
                    
                item = {
                    'code': code,
                    'type': item_type,
                    'is_active': True,
                }
                if 'Koordinat' in row: item['coordinates'] = str(row['Koordinat']).strip() if pd.notnull(row['Koordinat']) else None
                if 'İlçe' in row: item['district'] = str(row['İlçe']).strip() if pd.notnull(row['İlçe']) else None
                if 'Semt' in row: item['neighborhood'] = str(row['Semt']).strip() if pd.notnull(row['Semt']) else None
                if 'Adres' in row: item['address'] = str(row['Adres']).strip() if pd.notnull(row['Adres']) else None
                if 'Rout No' in row: item['route_no'] = str(row['Rout No']).strip() if pd.notnull(row['Rout No']) else None
                if 'Network' in row: item['network'] = str(row['Network']).strip() if pd.notnull(row['Network']) else None
                
                items.append(item)
            
            # Deduplicate items by code
            seen_codes = set()
            unique_items = []
            for item in items:
                if item['code'] not in seen_codes:
                    unique_items.append(item)
                    seen_codes.add(item['code'])
            
            items = unique_items
            
            if items:
                print(f"Upserting {len(items)} items from {sheet}...")
                chunk_size = 50
                for i in range(0, len(items), chunk_size):
                    chunk = items[i:i + chunk_size]
                    response = requests.post(
                        f"{SUPABASE_URL}/rest/v1/inventory_items?on_conflict=code",
                        headers=HEADERS,
                        json=chunk
                    )
                    if response.status_code not in [200, 201]:
                        print(f"Error upserting chunk {i}: {response.text}")
                    else:
                        print(f"Successfully upserted {len(chunk)} items.")
            else:
                print(f"No valid items found in sheet {sheet}")
                
    except Exception as e:
        print(f"Error processing {filename}: {e}")

if __name__ == '__main__':
    update_from_excel('Ürün Envanteri Güncel.xlsx')
    update_from_excel('Karşıyaka Ürün Envanteri.xlsx')
    print("\n--- Done ---")
