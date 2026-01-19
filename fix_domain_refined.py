import re
import os

filepath = r"d:\acursor\jul4\QUICK_FIX.md"

with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Fix the site URL
content = content.replace("https://cınarcrm.online", "https://cınarcrm.online") # No change needed if already right
# Fix the API URL (reversing the mistake)
content = content.replace("https://bacınarcrm.online/api", "https://backend.cınarcrm.online/api")
content = content.replace("VITE_API_URL=https://bacınarcrm.online/api", "VITE_API_URL=https://backend.cınarcrm.online/api")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Refined domain fix in QUICK_FIX.md")
