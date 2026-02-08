import pandas as pd
import json

def inspect_excel(filename):
    with open('inspection_report.txt', 'w', encoding='utf-8') as report:
        try:
            xl = pd.ExcelFile(filename)
            report.write(f"Sheets: {xl.sheet_names}\n")
            for sheet in xl.sheet_names:
                report.write(f"\n--- {sheet} ---\n")
                df = pd.read_excel(xl, sheet_name=sheet)
                report.write(f"Total Rows: {len(df)}\n")
                report.write(f"Columns: {df.columns.tolist()}\n")
                if len(df) > 0:
                    report.write("First Row Example:\n")
                    report.write(str(df.iloc[0].to_dict()) + "\n")
        except Exception as e:
            report.write(f"Error: {e}\n")
    print("Report written to inspection_report.txt")

if __name__ == '__main__':
    inspect_excel('Ürün Envanteri Güncel.xlsx')
