import re
import os

filepath = r"d:\acursor\jul4\QUICK_FIX.md"

with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Replace any occurrence of c...nar.online where ... are non-ascii
new_content = re.sub(r'c\S+nar\.online', 'cınarcrm.online', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Fixed domain in QUICK_FIX.md")
