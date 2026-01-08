import json

with open('excel_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

formatted_data = []
for i, item in enumerate(data):
    # Determine network - roughly split them
    network = (i % 5) + 1
    
    formatted_item = {
        "id": str(i + 1),
        "yil": 2026,
        "ay": "Ocak",
        "hafta": "5.01.2026",
        "koordinat": item.get("Koordinat", ""),
        "ilce": item.get("İlçe", ""),
        "semt": item.get("Semt", ""),
        "adres": item.get("Adres", ""),
        "kod": item.get("Kod", ""),
        "network": network,
        "marka1Opsiyon": "",
        "marka2Opsiyon": "",
        "marka3Opsiyon": "",
        "marka4Opsiyon": "",
        "durum": "BOŞ",
        "productType": "BB" if item.get("Kod", "").startswith("BB") else "CLP"
    }
    formatted_data.append(formatted_item)

with open('formatted_locations.json', 'w', encoding='utf-8') as f:
    json.dump(formatted_data, f, ensure_ascii=False, indent=2)

print(f"Formatted {len(formatted_data)} items.")
