import pandas as pd
from supabase import create_client
import os

# Supabase configuration
SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Read Excel file
df = pd.read_excel(r'Karşıyaka Ürün Envanteri.xlsx')

# Filter out header rows (where Kod is literally 'Kod')
df = df[df['Kod'] != 'Kod']

# Create mapping of code -> network
network_mapping = {}
for _, row in df.iterrows():
    code = str(row['Kod']).strip()
    network = str(row['Network']).strip()
    if code and network and code != 'nan':
        # Convert network values
        if network == 'BLD':
            network_mapping[code] = 'BELEDİYE'
        elif network in ['1', '2', '3', '4']:
            network_mapping[code] = network
        else:
            network_mapping[code] = network

print(f"Found {len(network_mapping)} items to update")
print("\nSample mappings:")
for i, (code, network) in enumerate(list(network_mapping.items())[:10]):
    print(f"  {code} -> Network {network}")

# Update each item in Supabase
updated = 0
errors = 0
for code, network in network_mapping.items():
    try:
        result = supabase.table('inventory_items').update({
            'network': network
        }).eq('code', code).execute()
        
        if result.data:
            updated += 1
            print(f"✓ Updated {code} -> Network {network}")
        else:
            print(f"? No match for {code}")
    except Exception as e:
        errors += 1
        print(f"✗ Error updating {code}: {e}")

print(f"\n=== Summary ===")
print(f"Updated: {updated}")
print(f"Errors: {errors}")
