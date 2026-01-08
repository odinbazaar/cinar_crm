import pandas as pd
import json

def extract_inventory():
    try:
        xl = pd.ExcelFile('exel.xls')
        inventory_data = {}
        for sheet in ['BB', 'CLP', 'GB', 'MGL']:
            df = pd.read_excel(xl, sheet_name=sheet)
            # Remove entirely empty rows and columns
            df = df.dropna(how='all').dropna(axis=1, how='all')
            inventory_data[sheet] = df.to_dict(orient='records')
        
        with open('inventory_raw.json', 'w', encoding='utf-8') as f:
            json.dump(inventory_data, f, ensure_ascii=False, indent=2)
        print("Inventory data extracted to inventory_raw.json")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    extract_inventory()
