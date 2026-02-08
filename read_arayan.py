import pandas as pd
import json
import glob
import os
from datetime import datetime

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, pd.Timestamp)):
            return obj.isoformat()
        return super(DateTimeEncoder, self).default(obj)

files = glob.glob("ARAYAN*.xlsx")
if not files:
    print("No file found starting with ARAYAN")
    exit(1)

file_path = files[0]
print(f"Reading file: {file_path}")

try:
    excel_file = pd.ExcelFile(file_path)
    all_data = []
    
    for sheet_name in excel_file.sheet_names:
        print(f"\n--- Sheet: {sheet_name} ---")
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        print(f"Total rows: {len(df)}")
        if len(df) > 0:
            print("First row:", df.iloc[0].to_dict())
            print("Last row:", df.iloc[-1].to_dict())
        
        # Add year from sheet name
        if len(sheet_name) == 4 and sheet_name.isdigit():
            df['_sheet_year'] = int(sheet_name)
        else:
            df['_sheet_name'] = sheet_name
            
        df.columns = [str(c).strip().upper() for c in df.columns]
        all_data.append(df)
        
    combined_df = pd.concat(all_data, ignore_index=True)
    combined_df = combined_df.fillna("")
    data = combined_df.to_dict(orient='records')
    
    with open('arayan_firmalar.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, cls=DateTimeEncoder, ensure_ascii=False, indent=2)
        
    print(f"\nTOTAL ROWS COMBINED: {len(data)}")
except Exception as e:
    print(f"Error: {e}")
