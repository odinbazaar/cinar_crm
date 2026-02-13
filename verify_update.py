import pandas as pd
import requests
import os
from dotenv import load_dotenv
import json

load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
}

def verify():
    codes = ['BB2301', 'CLP0801']
    url = f"{SUPABASE_URL}/rest/v1/inventory_items?code=in.({','.join(codes)})"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        print("Verification Data:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Error: {response.status_code} - {response.text}")

if __name__ == '__main__':
    verify()
