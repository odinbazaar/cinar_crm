import pandas as pd
import requests
import os
import sys
from dotenv import load_dotenv

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

def update_inventory():
    filename = 'Güncel CLP & BB Envanteri.xlsx'
    if not os.path.exists(filename):
        print(f"File {filename} not found.")
        return

    try:
        xl = pd.ExcelFile(filename)
        all_items = []

        for sheet in xl.sheet_names:
            print(f"\nProcessing sheet: {sheet}")
            
            # Determine type from sheet name
            if 'BB' in sheet:
                item_type = 'BB'
            elif 'CLP' in sheet:
                item_type = 'CLP'
            else:
                item_type = sheet.strip()

            df = pd.read_excel(xl, sheet_name=sheet)
            
            # Clean column names (strip whitespace and handle potential encoding artifacts)
            df.columns = [str(c).strip() for c in df.columns]
            
            # Create a mapping for known columns to handle weird encodings
            col_map = {}
            for col in df.columns:
                lower_col = col.lower()
                if 'kod' in lower_col: col_map['code'] = col
                elif 'koordinat' in lower_col: col_map['coordinates'] = col
                elif 'l' in lower_col and 'e' in lower_col: col_map['district'] = col # matches 'İlçe' or '¦le'
                elif 'semt' in lower_col: col_map['neighborhood'] = col
                elif 'adres' in lower_col: col_map['address'] = col
                elif 'rout' in lower_col: col_map['route_no'] = col
                elif 'network' in lower_col: col_map['network'] = col

            print(f"Detected columns: {col_map}")

            if 'code' not in col_map:
                print(f"Skipping sheet {sheet}: 'Kod' column not found.")
                continue

            # Drop rows where code is null
            df = df.dropna(subset=[col_map['code']])

            for _, row in df.iterrows():
                code = str(row[col_map['code']]).strip()
                if not code or code.lower() in ['nan', 'none']:
                    continue
                
                # Check for "Kod" in the value itself (happens if header is messy)
                if code.lower() == 'kod':
                    continue

                item = {
                    'code': code.upper(),
                    'type': item_type,
                    'is_active': True,
                    'updated_at': pd.Timestamp.now().isoformat()
                }

                if 'coordinates' in col_map: item['coordinates'] = str(row[col_map['coordinates']]).strip() if pd.notnull(row[col_map['coordinates']]) else None
                if 'district' in col_map: item['district'] = str(row[col_map['district']]).strip() if pd.notnull(row[col_map['district']]) else None
                if 'neighborhood' in col_map: item['neighborhood'] = str(row[col_map['neighborhood']]).strip() if pd.notnull(row[col_map['neighborhood']]) else None
                if 'address' in col_map: item['address'] = str(row[col_map['address']]).strip() if pd.notnull(row[col_map['address']]) else None
                if 'route_no' in col_map: 
                    val = row[col_map['route_no']]
                    item['route_no'] = str(val).strip() if pd.notnull(val) else None
                if 'network' in col_map: 
                    val = row[col_map['network']]
                    # Convert to string/int correctly
                    if pd.notnull(val):
                        if isinstance(val, float) and val.is_integer():
                            item['network'] = str(int(val))
                        else:
                            item['network'] = str(val).strip()
                    else:
                        item['network'] = None

                all_items.append(item)

        if not all_items:
            print("No items found to update.")
            return

        # Deduplicate by code
        unique_items = {}
        for item in all_items:
            unique_items[item['code']] = item
        
        final_items = list(unique_items.values())
        print(f"\nTotal unique items to upsert: {len(final_items)}")

        # Upsert in chunks
        chunk_size = 50
        success_count = 0
        for i in range(0, len(final_items), chunk_size):
            chunk = final_items[i:i + chunk_size]
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/inventory_items?on_conflict=code",
                headers=HEADERS,
                json=chunk
            )
            if response.status_code not in [200, 201, 204]:
                print(f"Error upserting chunk {i//chunk_size + 1}: {response.text}")
            else:
                success_count += len(chunk)
                print(f"Successfully upserted {success_count}/{len(final_items)} items.")

    except Exception as e:
        print(f"Error processing inventory: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    update_inventory()
