import pandas as pd
import json

try:
    # Read the .xls file
    df = pd.read_excel('exel.xls')
    
    # Get column names
    columns = df.columns.tolist()
    
    # Save first 100 rows to a text file
    with open('excel_data.json', 'w', encoding='utf-8') as f:
        json.dump(df.head(100).to_dict(orient='records'), f, ensure_ascii=False, indent=2)
    
    print(f"Columns: {columns}")
    print("Data saved to excel_data.json")
    
except Exception as e:
    print(f"Error: {e}")
