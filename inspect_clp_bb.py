import pandas as pd

xl = pd.ExcelFile('Güncel CLP & BB Envanteri.xlsx')
for s in xl.sheet_names:
    df = pd.read_excel(xl, sheet_name=s)
    print(f'{s}: {len(df)} rows, unique Kod: {df["Kod"].nunique()}')
    codes = sorted(df["Kod"].unique())
    print(f'  First 10 codes: {codes[:10]}')
    print(f'  Last 10 codes: {codes[-10:]}')
    nw = df["Network"].dropna().unique()
    print(f'  Network values: {sorted(nw)}')
    rn = df["Rout No"].dropna().unique()
    print(f'  Rout No values: {sorted(rn)}')
