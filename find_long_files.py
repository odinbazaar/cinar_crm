import os

def check_files(dirs):
    long_files = []
    for d in dirs:
        for root, _, files in os.walk(d):
            if any(x in root for x in ['node_modules', 'dist', '.git', 'prisma']):
                continue
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.sql')):
                    path = os.path.join(root, file)
                    try:
                        with open(path, 'r', encoding='utf-8') as f:
                            lines = len(f.readlines())
                            if lines > 500:
                                long_files.append((lines, path))
                    except:
                        pass
    
    long_files.sort(reverse=True)
    # Print only top 20
    for lines, path in long_files[:20]:
        print(f"{lines}: {path}")

check_files(['backend/src', 'frontend/src', 'backend'])
