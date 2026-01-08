import json
import pandas as pd

def format_reservations():
    with open('rezervasyon_full.json', encoding='utf-8') as f:
        data = json.load(f)
    
    result = []
    for i, d in enumerate(data):
        # Hafta can be a number (timestamp) or string
        hafta = d.get('Hafta')
        if isinstance(hafta, (int, float)):
            try:
                # Assuming timestamp in ms
                hafta_str = pd.to_datetime(hafta, unit='ms').strftime('%d.%m.%Y')
            except:
                hafta_str = str(hafta)
        else:
            hafta_str = str(hafta) if hafta else ''

        # Durum mapping
        marka1 = d.get('Marka 1.Opsiyon')
        durum_excel = d.get('Durum')
        
        if durum_excel == 'KESİN':
            durum = 'KESİN'
        elif marka1 and marka1 != '*' and marka1 != '-':
            durum = 'OPSİYON'
        else:
            durum = 'BOŞ'

        # Product Type mapping
        kod = str(d.get('Kod', ''))
        if kod.startswith('BB'): product_type = 'BB'
        elif kod.startswith('CLP'): product_type = 'CLP'
        elif kod.startswith('GB'): product_type = 'GB'
        elif kod.startswith('MGL'): product_type = 'MGL'
        elif kod.startswith('LED'): product_type = 'LED'
        else: product_type = 'BB'

        item = {
            'id': str(i + 1),
            'yil': d.get('Yıl'),
            'ay': d.get('Ay'),
            'hafta': hafta_str,
            'koordinat': d.get('Koordinat'),
            'ilce': d.get('İlçe'),
            'semt': d.get('Semt'),
            'adres': d.get('Adres'),
            'kod': kod,
            'network': d.get('Network'),
            'marka1Opsiyon': d.get('Marka 1.Opsiyon') if d.get('Marka 1.Opsiyon') != '*' else '',
            'marka2Opsiyon': d.get('Marka 2.Opsiyon') if d.get('Marka 2.Opsiyon') != '*' else '',
            'marka3Opsiyon': d.get('Marka 3.Opsiyon') if d.get('Marka 3.Opsiyon') != '*' else '',
            'marka4Opsiyon': d.get('Marka 4.Opsiyon') if d.get('Marka 4.Opsiyon') != '*' else '',
            'durum': durum,
            'productType': product_type
        }
        result.append(item)
    
    with open('formatted_reservations.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    format_reservations()
