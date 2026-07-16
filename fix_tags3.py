import os, re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Count occurrences
    open_count = content.count('<>')
    close_count = content.count('</>')
    
    if open_count > close_count:
        match = re.search(r'\r?\n(\s*)\);\r?\n\}', content)
        if match:
            indent = match.group(1) + '    '
            content = content[:match.start()] + f'\n{indent}</>' + content[match.start():]
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {filepath}")
        else:
            print(f"Could not find ending in {filepath}")

base_dir = 'resources/js/pages/Admin'
for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.jsx'):
            fix_file(os.path.join(root, file))
